const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MONGO_OPTIONS = {
  tls: true,                       // required for Atlas non-SRV with ssl=true
  serverSelectionTimeoutMS: 15000, // wait up to 15s to find a primary
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  maxPoolSize: 10,
  minPoolSize: 2,
  retryWrites: true,
};

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let listenersAttached = false;

const attachListeners = () => {
  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB connected → db: "${mongoose.connection.name}" | host: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected.');
  });

  mongoose.connection.on('close', () => {
    logger.info('MongoDB connection closed.');
  });
};

const connectDB = async () => {
  if (!listenersAttached) {
    attachListeners();
    listenersAttached = true;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
      return; // success — listeners will log the 'connected' event
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);

      if (attempt === MAX_RETRIES) {
        logger.error('All MongoDB connection attempts exhausted. Shutting down.');
        process.exit(1);
      }

      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed gracefully.');
  }
};

module.exports = { connectDB, disconnectDB };
