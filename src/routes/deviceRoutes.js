const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");
const { authenticate } = require("../middleware/auth");
const {
  validateDeviceInput,
  checkDeviceOwnership,
} = require("../middleware/device");

// Create a new device
router.post(
  "/",
  authenticate,
  validateDeviceInput,
  deviceController.createDevice
);

// Get all devices for logged in user
router.get("/", authenticate, deviceController.getUserDevices);

// Get a specific device by ID
router.get(
  "/:deviceId",
  authenticate,
  checkDeviceOwnership,
  deviceController.getDeviceById
);

// Update a device
router.put(
  "/:deviceId",
  authenticate,
  checkDeviceOwnership,
  validateDeviceInput,
  deviceController.updateDevice
);

// Delete a device
router.delete(
  "/:deviceId",
  authenticate,
  checkDeviceOwnership,
  deviceController.deleteDevice
);

module.exports = router;

// Create device:
// POST /devices
// Body: {"deviceId": "123", "deviceName": "Car Sensor", "deviceSSID": "drivesense_123"}

// Get all devices:
// GET /devices

// Get device details:
// GET /devices/:deviceId

// Update device:
// PUT /devices/:deviceId
// Body: {"deviceName": "Updated Name", "deviceSSID": "new_ssid"}

// Delete device:
// DELETE /devices/:deviceId
