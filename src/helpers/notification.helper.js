const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Create a notification for a user (fire-and-forget, non-blocking)
 */
const notify = async (userId, title, message) => {
  try {
    await Notification.create({ userId, title, message });
  } catch (err) {
    logger.error(`Failed to create notification for user ${userId}: ${err.message}`);
  }
};

module.exports = { notify };
