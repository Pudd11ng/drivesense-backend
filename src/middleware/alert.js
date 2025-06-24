const Alert = require("../models/Alert");

// Valid behavior types
const VALID_BEHAVIORS = [
  "Drowsiness",
  "Distraction",
  "Phone Usage",
  "Intoxication",
];

// Validate alert input
const validateAlertInput = (req, res, next) => {
  // For creating a new alert
  if (req.method === "POST") {
    const { alertTypeName, musicPlayList, audioFilePath } = req.body;

    if (!alertTypeName) {
      return res.status(400).json({
        message: "Alert type name is required",
      });
    }

    // Validate musicPlayList
    if (musicPlayList && typeof musicPlayList === "object") {
      const validKeys = Object.keys(musicPlayList).some((key) =>
        VALID_BEHAVIORS.includes(key)
      );

      if (!validKeys) {
        return res.status(400).json({
          message: `musicPlayList must include at least one of: ${VALID_BEHAVIORS.join(
            ", "
          )}`,
        });
      }

      for (const [key, value] of Object.entries(musicPlayList)) {
        if (
          !value ||
          typeof value !== "object" ||
          !("name" in value) ||
          !("path" in value)
        ) {
          return res.status(400).json({
            message: `Each behavior in musicPlayList must have 'name' and 'path' properties`,
          });
        }
      }
    }

    // Validate audioFilePath
    if (audioFilePath && typeof audioFilePath === "object") {
      const validKeys = Object.keys(audioFilePath).some((key) =>
        VALID_BEHAVIORS.includes(key)
      );

      if (!validKeys) {
        return res.status(400).json({
          message: `audioFilePath must include at least one of: ${VALID_BEHAVIORS.join(
            ", "
          )}`,
        });
      }

      for (const [key, value] of Object.entries(audioFilePath)) {
        if (
          !value ||
          typeof value !== "object" ||
          !("name" in value) ||
          !("path" in value)
        ) {
          return res.status(400).json({
            message: `Each behavior in audioFilePath must have 'name' and 'path' properties`,
          });
        }
      }
    }
  }

  // For updating an existing alert
  if (req.method === "PUT") {
    const { alertTypeName, musicPlayList, audioFilePath } = req.body;

    if (!alertTypeName && !musicPlayList && !audioFilePath) {
      return res.status(400).json({
        message: "At least one field must be provided for update",
      });
    }

    // Validate musicPlayList if provided
    if (
      alertTypeName === "Music" &&
      musicPlayList &&
      typeof musicPlayList === "object"
    ) {
      if (Object.keys(musicPlayList).length > 0) {
        const validKeys = Object.keys(musicPlayList).some((key) =>
          VALID_BEHAVIORS.includes(key)
        );

        if (!validKeys) {
          return res.status(400).json({
            message: `musicPlayList must include at least one of: ${VALID_BEHAVIORS.join(
              ", "
            )}`,
          });
        }

        for (const [key, value] of Object.entries(musicPlayList)) {
          if (
            !value ||
            typeof value !== "object" ||
            !("name" in value) ||
            !("path" in value)
          ) {
            return res.status(400).json({
              message: `Each behavior in musicPlayList must have 'name' and 'path' properties`,
            });
          }
        }
      }
    }

    // Validate audioFilePath if provided
    if (
      alertTypeName === "Self-Configured Audio" &&
      audioFilePath &&
      typeof audioFilePath === "object"
    ) {
      if (Object.keys(audioFilePath).length > 0) {
        const validKeys = Object.keys(audioFilePath).some((key) =>
          VALID_BEHAVIORS.includes(key)
        );

        if (!validKeys) {
          return res.status(400).json({
            message: `audioFilePath must include at least one of: ${VALID_BEHAVIORS.join(
              ", "
            )}`,
          });
        }

        for (const [key, value] of Object.entries(audioFilePath)) {
          if (
            !value ||
            typeof value !== "object" ||
            !("name" in value) ||
            !("path" in value)
          ) {
            return res.status(400).json({
              message: `Each behavior in audioFilePath must have 'name' and 'path' properties`,
            });
          }
        }
      }
    }
  }

  next();
};

// Check alert ownership
const checkAlertOwnership = async (req, res, next) => {
  try {
    const alertId = req.params.alertId;

    // Find the alert entry
    const alert = await Alert.findById(alertId);

    // Check if it exists
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    // Check if it belongs to the authenticated user
    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You don't own this alert",
      });
    }

    // Add the alert to the request object
    req.alert = alert;
    next();
  } catch (error) {
    console.error("Alert ownership check error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  validateAlertInput,
  checkAlertOwnership,
  VALID_BEHAVIORS,
};
