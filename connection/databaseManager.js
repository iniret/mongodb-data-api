const mongoose = require("mongoose");
require("dotenv").config();

const connections = {}; // Cache for database connections

/**
 * Get cluster configuration from environment variables
 * @param {string} cluster - The cluster identifier (optional)
 * @returns {object} - Object with uri and options
 */
const getClusterConfig = (cluster) => {
  // If no cluster specified, use default MONGO_URI
  if (!cluster) {
    const uri = process.env.MONGO_URI;
    const options = process.env.MONGO_OPTIONS || "";
    
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env file!");
    }
    
    return { uri, options };
  }

  // Look for cluster-specific configuration
  const clusterKey = cluster.toUpperCase();
  const uri = process.env[`MONGO_URI_${clusterKey}`];
  const options = process.env[`MONGO_OPTIONS_${clusterKey}`] || "";

  if (!uri) {
    throw new Error(`MONGO_URI_${clusterKey} is not defined in .env file!`);
  }

  return { uri, options };
};

/**
 * Manages MongoDB database connections with multi-cluster support.
 * @param {string} database - The database name.
 * @param {string} cluster - The cluster identifier (optional).
 * @returns {mongoose.Connection} - Mongoose connection instance.
 */
const getDatabaseConnection = (database, cluster = null) => {
  // Create unique connection key including cluster
  const connectionKey = cluster ? `${cluster}.${database}` : database;

  // If connection does not exist, create it
  if (!connections[connectionKey]) {
    const { uri, options } = getClusterConfig(cluster);
    
    connections[connectionKey] = mongoose.createConnection(
      `${uri}/${database}${options}`
    );

    // Handle connection errors
    connections[connectionKey].on("error", (err) => {
      const clusterInfo = cluster ? ` (cluster: ${cluster})` : "";
      console.error(`MongoDB connection error for ${database}${clusterInfo}:`, err);
    });

    connections[connectionKey].once("open", () => {
      const clusterInfo = cluster ? ` (cluster: ${cluster})` : "";
      console.log(`Connected to MongoDB database: ${database}${clusterInfo}`);
    });
  }

  return connections[connectionKey];
};

module.exports = getDatabaseConnection;
