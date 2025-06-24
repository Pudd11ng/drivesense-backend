const Device = require("../models/Device");

// Validate device input
const validateDeviceInput = (req, res, next) => {
  const { deviceName, deviceSSID } = req.body;

  // For creating a new device
  if (req.method === "POST") {
    if (!deviceName || !deviceSSID) {
      return res.status(400).json({
        message: "Device name and SSID are required",
      });
    }
  }

  // For updating an existing device
  if (req.method === "PUT") {
    if (!deviceName && !deviceSSID) {
      return res.status(400).json({
        message:
          "At least one field (deviceName or deviceSSID) is required for update",
      });
    }
  }

  next();
};

// Check device ownership
const checkDeviceOwnership = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId;

    // Find the device
    const device = await Device.findById(deviceId);

    // Check if device exists
    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    // Check if the device belongs to the authenticated user
    if (device.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You don't own this device",
      });
    }

    // Add the device to the request object for potential later use
    req.device = device;
    next();
  } catch (error) {
    console.error("Device ownership check error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  validateDeviceInput,
  checkDeviceOwnership,
};
