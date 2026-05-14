const notificationService = require('../services/notification.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');

const getNotifications = asyncHandler(async (req, res) => {
  const { notifications, pagination } = await notificationService.getNotifications(
    req.user._id,
    req.query
  );
  sendPaginated(res, 'Notifications fetched', notifications, pagination);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  sendSuccess(res, 'Notification marked as read', notification);
});

module.exports = { getNotifications, markAsRead };
