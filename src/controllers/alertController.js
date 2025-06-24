const Alert = require("../models/Alert");
const storageService = require('../services/storageService');

class AlertController {
  // Create a new alert
  async createAlert(req, res) {
    try {
      const { alertTypeName, musicPlayList, audioFilePath } = req.body;

      const alert = new Alert({
        alertTypeName,
        musicPlayList: musicPlayList || {},
        audioFilePath: audioFilePath || {},
        userId: req.user._id,
      });

      await alert.save();

      // Return the created alert with correct field names
      res.status(201).json({
        alertId: alert._id,
        alertTypeName: alert.alertTypeName,
        musicPlayList: alert.musicPlayList,
        audioFilePath: alert.audioFilePath,
      });
    } catch (error) {
      console.error("Create alert error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get all alerts for a user (or create default if none exists)
  async getUserAlerts(req, res) {
    try {
      let alerts = await Alert.find({ userId: req.user._id });

      if (alerts.length === 0) {
        const defaultAlert = new Alert({
          userId: req.user._id,
          alertTypeName: "Alarm",
          musicPlayList: {
            Drowsiness: { name: "", path: "" },
            Distraction: { name: "", path: "" },
            Intoxication: { name: "", path: "" },
            "Phone Usage": { name: "", path: "" },
          },
          audioFilePath: {
            Drowsiness: { name: "", path: "" },
            Distraction: { name: "", path: "" },
            Intoxication: { name: "", path: "" },
            "Phone Usage": { name: "", path: "" },
          },
        });

        await defaultAlert.save();
        alerts = [defaultAlert];
      }

      const formattedAlerts = alerts.map((alert) => ({
        alertId: alert._id,
        alertTypeName: alert.alertTypeName,
        musicPlayList: alert.musicPlayList,
        audioFilePath: alert.audioFilePath,
      }));

      res.status(200).json(formattedAlerts);
    } catch (error) {
      console.error("Get alerts error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get a specific alert by ID
  async getAlertById(req, res) {
    try {
      const alert = await Alert.findOne({
        _id: req.params.alertId,
        userId: req.user._id,
      });

      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      // Return the single alert with correct field names
      res.status(200).json({
        alertId: alert._id,
        alertTypeName: alert.alertTypeName,
        musicPlayList: alert.musicPlayList,
        audioFilePath: alert.audioFilePath,
      });
    } catch (error) {
      console.error("Get alert error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Update an alert
  async updateAlert(req, res) {
    try {
      const { alertTypeName, musicPlayList, audioFilePath } = req.body;

      // First, get the existing alert to compare files
      const existingAlert = await Alert.findOne({
        _id: req.params.alertId,
        userId: req.user._id,
      });

      if (!existingAlert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      // Track files to delete
      const filesToDelete = [];

      // Check for audioFilePath updates
      if (audioFilePath) {
        const behaviors = [
          "Drowsiness",
          "Distraction",
          "Intoxication",
          "Phone Usage",
        ];

        for (const behavior of behaviors) {
          // Skip if this behavior isn't being updated
          if (!audioFilePath[behavior]) continue;

          // Get existing data
          const existingBehavior = existingAlert.audioFilePath.get
            ? existingAlert.audioFilePath.get(behavior)
            : existingAlert.audioFilePath[behavior];

          // If we have existing data with a path and it's being changed
          if (
            existingBehavior &&
            existingBehavior.path &&
            audioFilePath[behavior].path &&
            existingBehavior.path !== audioFilePath[behavior].path &&
            existingBehavior.path !== ""
          ) {
            filesToDelete.push(existingBehavior.path);
            console.log(
              `Marking audio file for deletion: ${existingBehavior.path}`
            );
          }
        }
      }

      const updateData = {};
      if (alertTypeName) updateData.alertTypeName = alertTypeName;
      if (musicPlayList) updateData.musicPlayList = musicPlayList;
      if (audioFilePath) updateData.audioFilePath = audioFilePath;
      updateData.updatedAt = Date.now();

      const alert = await Alert.findOneAndUpdate(
        { _id: req.params.alertId, userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      );

      // Delete old files after database update (non-blocking)
      if (filesToDelete.length > 0) {
        // We don't await this to keep the API response fast
        Promise.all(
          filesToDelete.map((path) => storageService.deleteFile(path))
        ).catch((err) => console.error("Error cleaning up old files:", err));
      }

      // Return the updated alert with correct field names
      res.status(200).json({
        alertId: alert._id,
        alertTypeName: alert.alertTypeName,
        musicPlayList: alert.musicPlayList,
        audioFilePath: alert.audioFilePath,
      });
    } catch (error) {
      console.error("Update alert error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Delete an alert
  async deleteAlert(req, res) {
    try {
      const alert = await Alert.findOne({
        _id: req.params.alertId,
        userId: req.user._id,
      });

      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }

      // Collect all file paths to delete
      const filesToDelete = [];
      const behaviors = [
        "Drowsiness",
        "Distraction",
        "Intoxication",
        "Phone Usage",
      ];

      // Add audio file paths
      for (const behavior of behaviors) {
        const behaviorData = alert.audioFilePath.get
          ? alert.audioFilePath.get(behavior)
          : alert.audioFilePath[behavior];

        if (behaviorData && behaviorData.path && behaviorData.path !== "") {
          filesToDelete.push(behaviorData.path);
        }
      }

      // Delete the alert from the database
      await Alert.deleteOne({ _id: req.params.alertId, userId: req.user._id });

      // Delete all associated files (non-blocking)
      if (filesToDelete.length > 0) {
        Promise.all(
          filesToDelete.map((path) => storageService.deleteFile(path))
        ).catch((err) => console.error("Error cleaning up files:", err));
      }

      res.status(200).json({ message: "Alert deleted successfully" });
    } catch (error) {
      console.error("Delete alert error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

// Create instance and bind methods
const alertController = new AlertController();
module.exports = {
  createAlert: alertController.createAlert.bind(alertController),
  getUserAlerts: alertController.getUserAlerts.bind(alertController),
  getAlertById: alertController.getAlertById.bind(alertController),
  updateAlert: alertController.updateAlert.bind(alertController),
  deleteAlert: alertController.deleteAlert.bind(alertController),
};
