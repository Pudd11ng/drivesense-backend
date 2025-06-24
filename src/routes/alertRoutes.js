const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const fileController = require("../controllers/fileController");
const { authenticate } = require("../middleware/auth");
const {
  validateAlertInput,
  checkAlertOwnership,
} = require("../middleware/alert");

// Create a new alert
router.post(
  "/",
  authenticate,
  validateAlertInput,
  alertController.createAlert
);

// Get all user's alerts with optional filtering
router.get(
  "/",
  authenticate,
  alertController.getUserAlerts
);

// Route to get signed URL for direct upload to Google Cloud Storage
router.get(
  "/upload-url",
  authenticate,
  fileController.getSignedUploadUrl
);

// Get a specific alert by ID
router.get(
  "/:alertId",
  authenticate,
  checkAlertOwnership,
  alertController.getAlertById
);

// Update an alert
router.put(
  "/:alertId",
  authenticate,
  checkAlertOwnership,
  validateAlertInput,
  alertController.updateAlert
);

// Delete an alert
router.delete(
  "/:alertId",
  authenticate,
  checkAlertOwnership,
  alertController.deleteAlert
);

module.exports = router;