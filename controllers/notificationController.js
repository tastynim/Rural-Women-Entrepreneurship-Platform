const Notification = require("../models/Notification");

// Helper used by other controllers to create a notification
const createNotification = async (userId, title, message, type = "general", link = "") => {
  try {
    await Notification.create({ user: userId, title, message, type, link });
  } catch (err) {
    console.error("createNotification error:", err.message);
  }
};

// GET /api/notifications — get all notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch unread count" });
  }
};

// PATCH /api/notifications/:id/read — mark one as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true }
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// PATCH /api/notifications/read-all — mark ALL as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
