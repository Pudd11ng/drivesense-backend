const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");

// Get all notifications for the user
router.get("/", authenticate, notificationController.getUserNotifications);

// Delete all notifications
router.delete("/", authenticate, notificationController.clearAllNotifications);

// Get unread notification count
router.get("/unread-count", authenticate, notificationController.getUnreadCount);

// Mark all notifications as read
router.put("/read-all", authenticate, notificationController.markAllNotificationsRead);

// Mark notification as read
router.put("/:notificationId/read", authenticate, notificationController.markNotificationRead);

// Delete a notification
router.delete("/:notificationId", authenticate, notificationController.deleteNotification);

module.exports = router;