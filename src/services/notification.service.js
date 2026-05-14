const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

const getNotifications = async (userId, query) => {
  const { page, limit, skip } = getPagination(query);
  const filter = { userId };
  if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  return { notifications, pagination: buildPaginationMeta(total, page, limit) };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  return notification;
};

module.exports = { getNotifications, markAsRead };
