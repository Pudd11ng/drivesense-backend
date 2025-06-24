const Device = require("../models/Device");

class DeviceController {
  // Create a new device
  async createDevice(req, res) {
    try {
      const { deviceName, deviceSSID } = req.body;

      // Create new device with user association
      const device = new Device({
        deviceName,
        deviceSSID,
        userId: req.user._id,
      });

      await device.save();
      res.status(201).json(device);
    } catch (error) {
      console.error("Create device error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get all devices for a user
  async getUserDevices(req, res) {
    try {
      const devices = await Device.find({ userId: req.user._id });
      res.status(200).json(devices);
    } catch (error) {
      console.error("Get devices error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get a specific device by ID
  async getDeviceById(req, res) {
    try {
      const device = await Device.findOne({
        _id: req.params.deviceId,
        userId: req.user._id,
      });

      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      res.status(200).json(device);
    } catch (error) {
      console.error("Get device error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Update a device
  async updateDevice(req, res) {
    try {
      const { deviceName, deviceSSID } = req.body;

      // Find and update the device, ensuring it belongs to the user
      const device = await Device.findOneAndUpdate(
        { _id: req.params.deviceId, userId: req.user._id },
        {
          deviceName,
          deviceSSID,
          updatedAt: Date.now(),
        },
        { new: true, runValidators: true }
      );

      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      res.status(200).json(device);
    } catch (error) {
      console.error("Update device error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Delete a device
  async deleteDevice(req, res) {
    try {
      const device = await Device.findOneAndDelete({
        _id: req.params.deviceId,
        userId: req.user._id,
      });

      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      res.status(200).json({ message: "Device deleted successfully" });
    } catch (error) {
      console.error("Delete device error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

// Create instance and bind methods
const deviceController = new DeviceController();
module.exports = {
  createDevice: deviceController.createDevice.bind(deviceController),
  getUserDevices: deviceController.getUserDevices.bind(deviceController),
  getDeviceById: deviceController.getDeviceById.bind(deviceController),
  updateDevice: deviceController.updateDevice.bind(deviceController),
  deleteDevice: deviceController.deleteDevice.bind(deviceController),
};
