
/**
 * Defines the routes for all API endpoints and maps them to the corresponding functions in the dbController class.
 */
const express = require('express');
const dbController = require('../controllers/dbController');
const { connectionReady } = require('../connection/databaseManager');

const router = express.Router();

// Ensure the MongoDB connection is fully open before the controller runs.
// Otherwise the first request on a cold start sits in mongoose's command
// buffer and fails with "Operation buffering timed out".
const ensureConnected = async (req, res, next) => {
  const { database, cluster } = req.body || {};
  if (!database) {
    return res.status(400).json({ success: false, error: "database is required" });
  }
  try {
    await connectionReady(database, cluster || null);
    next();
  } catch (err) {
    res.status(503).json({
      success: false,
      error: `MongoDB connection failed: ${err.message}`,
    });
  }
};

router.post('/insertOne', ensureConnected, dbController.insertOne);
router.post('/insertMany', ensureConnected, dbController.insertMany);
router.post('/findOne', ensureConnected, dbController.findOne);
router.post('/find', ensureConnected, dbController.find);
router.post('/updateOne', ensureConnected, dbController.updateOne);
router.post('/deleteOne', ensureConnected, dbController.deleteOne);
router.post('/deleteMany', ensureConnected, dbController.deleteMany);
router.post('/aggregate', ensureConnected, dbController.aggregate);

module.exports = router;
