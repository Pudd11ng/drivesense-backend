const Notification = require("../models/Notification");

class NotificationController {
  // Get user's notifications with pagination
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 20, skip = 0, read } = req.query;
      
      // Build filter
      const filter = { userId };
      
      // Add read filter if provided
      if (read !== undefined) {
        filter.isRead = read === 'true';
      }
      
      // Get notifications with pagination
      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit));
      
      // Get total count for pagination
      const totalCount = await Notification.countDocuments(filter);
      
      // Get unread count
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });
      
      // Format notifications to match Flutter model exactly
      const formattedNotifications = notifications.map(notification => ({
        notificationId: notification._id.toString(),
        title: notification.title,
        body: notification.body,
        type: notification.type,
        isRead: notification.isRead,
        data: notification.data || {},
        createdAt: notification.createdAt
      }));
      
      res.status(200).json({
        notifications: formattedNotifications,
        totalCount,
        unreadCount,
        hasMore: totalCount > (Number(skip) + notifications.length)
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Mark notification as read
  async markNotificationRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;
      
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      // Format to match Flutter model
      const formattedNotification = {
        notificationId: notification._id.toString(),
        title: notification.title,
        body: notification.body,
        type: notification.type,
        isRead: notification.isRead,
        data: notification.data || {},
        createdAt: notification.createdAt
      };
      
      res.status(200).json(formattedNotification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Mark all notifications as read
  async markAllNotificationsRead(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      
      res.status(200).json({ 
        message: "All notifications marked as read",
        count: result.modifiedCount
      });
    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Delete a notification
  async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;
      
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Delete notification error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Clear all notifications
  async clearAllNotifications(req, res) {
    try {
      const userId = req.user.id;
      
      const result = await Notification.deleteMany({ userId });
      
      res.status(200).json({ 
        message: "All notifications cleared",
        count: result.deletedCount
      });
    } catch (error) {
      console.error("Clear all notifications error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get unread notification count
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      
      const count = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });
      
      res.status(200).json({ unreadCount: count });
    } catch (error) {
      console.error("Get unread count error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

const controller = new NotificationController();
module.exports = {
  getUserNotifications: controller.getUserNotifications.bind(controller),
  markNotificationRead: controller.markNotificationRead.bind(controller),
  markAllNotificationsRead: controller.markAllNotificationsRead.bind(controller),
  deleteNotification: controller.deleteNotification.bind(controller),
  clearAllNotifications: controller.clearAllNotifications.bind(controller),
  getUnreadCount: controller.getUnreadCount.bind(controller),
};