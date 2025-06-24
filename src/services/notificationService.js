const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/User");
const Notification = require("../models/Notification");
const path = require("path");

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(
      path.join(__dirname, "../config/firebase-service-account.json")
    ),
  });
} catch (error) {
  console.log("Firebase admin initialization:", error.message);
}

function formatDateTime(dateTime) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateTime));
}

class NotificationService {
  /**
   * Create an in-app notification in the database
   * @param {string} userId - User ID to receive the notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {string} type - Notification type
   * @param {Object} data - Additional data
   * @returns {Promise<Object>} Created notification
   */
  async createInAppNotification(
    userId,
    title,
    body,
    type = "general",
    data = {}
  ) {
    try {
      const notification = new Notification({
        userId,
        title,
        body,
        type,
        data,
        isRead: false,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating in-app notification:", error);
      return null;
    }
  }

  /**
   * Send accident notification to emergency contacts
   * @param {string} userId - ID of user who had the accident
   * @param {Object} accident - Accident data
   * @returns {Promise<Object>} Result of notification attempt
   */
  async sendAccidentNotifications(userId, accident) {
    try {
      // Get user with populated emergency contacts
      const user = await User.findById(userId).populate(
        "emergencyContactUserIds",
        "firstName lastName email fcmTokens"
      );

      if (!user) {
        console.log("User not found for accident notification");
        return { success: false, error: "User not found" };
      }

      if (!user.emergencyContactUserIds?.length) {
        console.log("No emergency contacts found for user");
        return { success: false, error: "No emergency contacts" };
      }

      // Format user name for notification
      const userName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        "Your contact";

      // Format location data
      let locationText = "Unknown location";
      if (accident.location) {
        locationText = accident.location;
      }

      // Prepare notification content
      const title = "⚠️ Emergency: Accident Detected";
      const body = `${userName} may have been in an accident. Tap for details.`;

      // Additional data for the app to use
      const data = {
        type: "accident_alert",
        detectedTime: formatDateTime(accident.detectedTime),
        location: locationText,
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
      };

      // Collect all FCM tokens from emergency contacts
      const fcmTokens = [];
      const notifiedContacts = [];

      // Create in-app notifications and collect FCM tokens
      for (const contact of user.emergencyContactUserIds) {
        // Create in-app notification for each emergency contact
        await this.createInAppNotification(
          contact._id,
          title,
          body,
          "accident_alert",
          data
        );

        notifiedContacts.push(contact._id);

        if (contact.fcmTokens?.length) {
          fcmTokens.push(...contact.fcmTokens);
        }
      }

      if (!fcmTokens.length) {
        console.log("No FCM tokens found for emergency contacts");
        return {
          success: true,
          fcmSent: false,
          inAppSent: true,
          notifiedContacts,
        };
      }

      // Send push notifications in batches
      const batchSize = 500;
      const successResults = [];
      const failureResults = [];

      for (let i = 0; i < fcmTokens.length; i += batchSize) {
        const tokenBatch = fcmTokens.slice(i, i + batchSize);

        try {
          const message = {
            tokens: tokenBatch,
            notification: {
              title,
              body,
            },
            data: this._convertToStringValues(data),
            android: {
              priority: "high",
              notification: {
                channelId: "accidents",
                priority: "max",
                sound: "alarm",
                icon: "@drawable/notification_icon",
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                  category: "ACCIDENT",
                  contentAvailable: true,
                },
              },
              headers: {
                "apns-priority": "10",
              },
            },
          };

          const result = await getMessaging().sendEachForMulticast(message);

          successResults.push(result);
        } catch (error) {
          console.error("Error sending notification batch:", error);
          failureResults.push(error);
        }
      }

      // Calculate total success/failure counts
      const totalSent = successResults.reduce(
        (sum, result) => sum + result.successCount,
        0
      );
      const totalFailed = successResults.reduce(
        (sum, result) => sum + result.failureCount,
        0
      );

      console.log(
        `Accident notifications: ${totalSent} sent, ${totalFailed} failed`
      );

      return {
        success: true,
        fcmSent: totalSent > 0,
        inAppSent: true,
        sent: totalSent,
        failed: totalFailed,
        tokens: fcmTokens.length,
        notifiedContacts,
        errors: failureResults,
      };
    } catch (error) {
      console.error("Error in sendAccidentNotifications:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a general notification to a user
   * @param {string} userId - User ID to notify
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {object} data - Additional data
   * @returns {Promise<object>} Notification result
   */
  async sendGeneralNotification(userId, title, body, data = {}) {
    try {
      // Create in-app notification
      const notification = await this.createInAppNotification(
        userId,
        title,
        body,
        "general",
        data
      );

      // Get user's FCM tokens
      const user = await User.findById(userId).select("fcmTokens");

      if (!user?.fcmTokens?.length) {
        return {
          success: true,
          inAppSent: true,
          fcmSent: false,
          notificationId: notification._id,
        };
      }

      const message = {
        tokens: user.fcmTokens,
        notification: { title, body },
        data: this._convertToStringValues(data),
        android: {
          priority: "high",
          notification: {
            channelId: "general",
          },
        },
      };

      const result = await getMessaging().sendEachForMulticast(message);

      return {
        success: true,
        inAppSent: true,
        fcmSent: result.successCount > 0,
        sent: result.successCount,
        failed: result.failureCount,
        tokens: user.fcmTokens.length,
        notificationId: notification._id,
      };
    } catch (error) {
      console.error("Error sending general notification:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert all object values to strings (required by FCM)
   * @private
   */
  _convertToStringValues(obj) {
    const result = {};
    for (const key in obj) {
      result[key] = String(obj[key]);
    }
    return result;
  }
}

module.exports = new NotificationService();
