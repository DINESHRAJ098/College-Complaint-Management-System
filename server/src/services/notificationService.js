const Notification = require('../models/Notification');
const { emitNotification } = require('../config/socket');

const getUserNotifications = async (userId) => {
  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate('complaint', 'ticketNumber title status priority');
  return notifications;
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  return { success: true };
};

const createNotification = async ({ recipient, complaint, title, message, type }) => {
  const notification = await Notification.create({
    recipient,
    complaint,
    title,
    message,
    type
  });

  // Emit real-time notification
  emitNotification(recipient.toString(), notification);
  return notification;
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification
};
