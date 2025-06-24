const Accident = require("../models/Accident");
const notificationService = require("../services/notificationService");

class AccidentController {
  // Create a new accident record
  async createAccident(req, res) {
    try {
      const { detectedTime, location, contactNum, contactTime, deviceId } =
        req.body;

      // Create new accident with user association
      const accident = new Accident({
        detectedTime: detectedTime || Date.now(),
        location,
        contactNum,
        contactTime: new Date(contactTime), // Ensure it's parsed as Date
        userId: req.user._id,
        deviceId: deviceId || null,
      });

      await accident.save();

      // Send notifications to emergency contacts
      notificationService
        .sendAccidentNotifications(req.user._id, accident)
        .catch((error) => {
          console.error("Error sending accident notifications:", error);
        });

      res.status(201).json(accident);
    } catch (error) {
      console.error("Create accident error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get all accidents for a user
  async getUserAccidents(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Build query filter
      const filter = { userId: req.user._id };

      // Add date range filter if provided
      if (startDate || endDate) {
        filter.detectedTime = {};
        if (startDate) filter.detectedTime.$gte = new Date(startDate);
        if (endDate) filter.detectedTime.$lte = new Date(endDate);
      }

      const accidents = await Accident.find(filter).sort({ detectedTime: -1 });
      res.status(200).json(accidents);
    } catch (error) {
      console.error("Get accidents error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get a specific accident by ID
  async getAccidentById(req, res) {
    try {
      const accident = await Accident.findOne({
        _id: req.params.accidentId,
        userId: req.user._id,
      });

      if (!accident) {
        return res.status(404).json({ message: "Accident not found" });
      }

      res.status(200).json(accident);
    } catch (error) {
      console.error("Get accident error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Update an accident record
  async updateAccident(req, res) {
    try {
      const { detectedTime, location, contactNum, contactTime } = req.body;

      // Create update object with only provided fields
      const updateData = {};
      if (detectedTime) updateData.detectedTime = new Date(detectedTime);
      if (location) updateData.location = location;
      if (contactNum) updateData.contactNum = contactNum;
      if (contactTime) updateData.contactTime = new Date(contactTime);
      updateData.updatedAt = Date.now();

      // Find and update, ensuring it belongs to the user
      const accident = await Accident.findOneAndUpdate(
        { _id: req.params.accidentId, userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!accident) {
        return res.status(404).json({ message: "Accident not found" });
      }

      res.status(200).json(accident);
    } catch (error) {
      console.error("Update accident error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Delete an accident record
  async deleteAccident(req, res) {
    try {
      const accident = await Accident.findOneAndDelete({
        _id: req.params.accidentId,
        userId: req.user._id,
      });

      if (!accident) {
        return res.status(404).json({ message: "Accident not found" });
      }

      res.status(200).json({ message: "Accident record deleted successfully" });
    } catch (error) {
      console.error("Delete accident error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get accident statistics
  async getAccidentStats(req, res) {
    try {
      const { startDate, endDate } = req.query;

      // Build time range filter
      const timeFilter = {};
      if (startDate) timeFilter.$gte = new Date(startDate);
      if (endDate) timeFilter.$lte = new Date(endDate);

      // Base match for user's data
      const matchStage = { userId: req.user._id };
      if (startDate || endDate) matchStage.detectedTime = timeFilter;

      const stats = await Accident.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            latestAccident: { $max: "$detectedTime" },
            earliestAccident: { $min: "$detectedTime" },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            latestAccident: 1,
            earliestAccident: 1,
            daysSinceLastAccident: {
              $divide: [
                { $subtract: [new Date(), "$latestAccident"] },
                1000 * 60 * 60 * 24, // Convert ms to days
              ],
            },
          },
        },
      ]);

      res.status(200).json(
        stats[0] || {
          total: 0,
          latestAccident: null,
          earliestAccident: null,
          daysSinceLastAccident: null,
        }
      );
    } catch (error) {
      console.error("Get accident stats error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

// Create instance and bind methods
const accidentController = new AccidentController();
module.exports = {
  createAccident: accidentController.createAccident.bind(accidentController),
  getUserAccidents:
    accidentController.getUserAccidents.bind(accidentController),
  getAccidentById: accidentController.getAccidentById.bind(accidentController),
  updateAccident: accidentController.updateAccident.bind(accidentController),
  deleteAccident: accidentController.deleteAccident.bind(accidentController),
  getAccidentStats:
    accidentController.getAccidentStats.bind(accidentController),
};
