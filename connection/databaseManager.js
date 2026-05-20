const mongoose = require("mongoose");
require("dotenv").config();

const connections = {}; // Cache for database connections

const getClusterConfig = (cluster) => {
  if (!cluster) {
    const uri = process.env.MONGO_URI;
    const options = process.env.MONGO_OPTIONS || "";
    if (!uri) throw new Error("MONGO_URI is not defined in .env file!");
    return { uri, options };
  }

  const clusterKey = cluster.toUpperCase();
  const uri = process.env[`MONGO_URI_${clusterKey}`];
  const options = process.env[`MONGO_OPTIONS_${clusterKey}`] || "";

  if (!uri) {
    throw new Error(`MONGO_URI_${clusterKey} is not defined in .env file!`);
  }

  return { uri, options };
};

const buildConnection = (database, cluster) => {
  const { uri, options } = getClusterConfig(cluster);
  const conn = mongoose.createConnection(`${uri}/${database}${options}`, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000,
    bufferTimeoutMS: 30000,
  });

  const clusterInfo = cluster ? ` (cluster: ${cluster})` : "";
  conn.on("error", (err) => {
    console.error(`MongoDB connection error for ${database}${clusterInfo}:`, err.message);
  });
  conn.once("open", () => {
    console.log(`Connected to MongoDB database: ${database}${clusterInfo}`);
  });

  // Cache the asPromise() so callers can await readiness without racing.
  conn.$ready = conn.asPromise();
  return conn;
};

const getDatabaseConnection = (database, cluster = null) => {
  const connectionKey = cluster ? `${cluster}.${database}` : database;
  if (!connections[connectionKey]) {
    connections[connectionKey] = buildConnection(database, cluster);
  }
  return connections[connectionKey];
};

/**
 * Awaits the underlying MongoDB connection so subsequent ops don't sit in
 * mongoose's command buffer. Rethrows the real connection error if it failed.
 */
const connectionReady = async (database, cluster = null) => {
  const conn = getDatabaseConnection(database, cluster);
  if (conn.readyState === 1) return conn;
  try {
    await conn.$ready;
  } catch (err) {
    // Drop the broken connection from cache so the next request retries.
    const key = cluster ? `${cluster}.${database}` : database;
    delete connections[key];
    throw err;
  }
  return conn;
};

module.exports = getDatabaseConnection;
module.exports.connectionReady = connectionReady;
