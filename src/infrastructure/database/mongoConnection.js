const mongoose = require('mongoose');
const logger = require('../logging/logger');
const config = require('../../../config');

let isConnected = false;

// Opens a connection to MongoDB with automatic retry.

async function connectToMongo(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(config.mongo.uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      logger.info(`Connected to MongoDB at ${config.mongo.uri}`);
      return;
    } catch (err) {
      logger.warn(
        `MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`,
      );
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw new Error('Unable to connect to MongoDB after multiple attempts');
}

// Gracefully close the connection called on SIGTERM / SIGINT.
 
async function disconnectMongo() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB');
  }
}

module.exports = { connectToMongo, disconnectMongo };
