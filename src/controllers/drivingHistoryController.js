const DrivingHistory = require("../models/DrivingHistory");
const Accident = require("../models/Accident");
const RiskyBehaviour = require("../models/RiskyBehaviour");
const geminiService = require("../services/geminiService");
const notificationService = require("../services/notificationService");

class DrivingHistoryController {
  // Create a new driving history entry
  async createDrivingHistory(req, res) {
    try {
      const { startTime, endTime, accidents, riskyBehaviours, deviceId } =
        req.body;

      // Create new driving history
      const drivingHistory = new DrivingHistory({
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        userId: req.user._id,
        deviceId: deviceId || null,
        accidents: accidents || [],
        riskyBehaviours: riskyBehaviours || [],
      });

      await drivingHistory.save();

      // Populate referenced models for the response
      await drivingHistory.populate([
        { path: "accidents" },
        { path: "riskyBehaviours" },
      ]);

      res.status(201).json(drivingHistory);
    } catch (error) {
      console.error("Create driving history error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get all driving histories for a user
  async getUserDrivingHistories(req, res) {
    try {
      const { startDate, endDate, limit = 10, page = 1 } = req.query;

      // Build query filter
      const filter = { userId: req.user._id };

      // Add date range filter if provided
      if (startDate || endDate) {
        if (startDate) filter.startTime = { $gte: new Date(startDate) };
        if (endDate) filter.endTime = { $lte: new Date(endDate) };
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Query with pagination
      const drivingHistories = await DrivingHistory.find(filter)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate([{ path: "accidents" }, { path: "riskyBehaviours" }]);

      // Get total count for pagination
      const total = await DrivingHistory.countDocuments(filter);

      res.status(200).json({
        data: drivingHistories,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get driving histories error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get a specific driving history by ID
  async getDrivingHistoryById(req, res) {
    try {
      const drivingHistory = await DrivingHistory.findOne({
        _id: req.params.historyId,
        userId: req.user._id,
      }).populate([{ path: "accidents" }, { path: "riskyBehaviours" }]);

      if (!drivingHistory) {
        return res.status(404).json({ message: "Driving history not found" });
      }

      res.status(200).json(drivingHistory);
    } catch (error) {
      console.error("Get driving history error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Update a driving history
  async updateDrivingHistory(req, res) {
    try {
      const { startTime, endTime, accidents, riskyBehaviours } = req.body;

      // Create update object with only provided fields
      const updateData = {};
      if (startTime) updateData.startTime = new Date(startTime);
      if (endTime) updateData.endTime = new Date(endTime);
      if (accidents) updateData.accidents = accidents;
      if (riskyBehaviours) updateData.riskyBehaviours = riskyBehaviours;
      updateData.updatedAt = Date.now();

      // Find and update, ensuring it belongs to the user
      const drivingHistory = await DrivingHistory.findOneAndUpdate(
        { _id: req.params.historyId, userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      ).populate([{ path: "accidents" }, { path: "riskyBehaviours" }]);

      if (!drivingHistory) {
        return res.status(404).json({ message: "Driving history not found" });
      }

      res.status(200).json(drivingHistory);
    } catch (error) {
      console.error("Update driving history error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Delete a driving history
  async deleteDrivingHistory(req, res) {
    try {
      const drivingHistory = await DrivingHistory.findOneAndDelete({
        _id: req.params.historyId,
        userId: req.user._id,
      });

      if (!drivingHistory) {
        return res.status(404).json({ message: "Driving history not found" });
      }

      res.status(200).json({ message: "Driving history deleted successfully" });
    } catch (error) {
      console.error("Delete driving history error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Add an accident to a driving history
  async addAccident(req, res) {
    try {
      const { detectedTime, location, contactNum, contactTime } = req.body;

      if (!location || !contactNum || !contactTime) {
        return res.status(400).json({
          message: "Location, contact number, and contact time are required",
        });
      }

      // Find the driving history
      const drivingHistory = await DrivingHistory.findOne({
        _id: req.params.historyId,
        userId: req.user._id,
      });

      if (!drivingHistory) {
        return res.status(404).json({ message: "Driving history not found" });
      }

      // Create a new accident record
      const accident = new Accident({
        detectedTime: detectedTime || Date.now(),
        location,
        contactNum,
        contactTime: new Date(contactTime),
        userId: req.user._id,
        deviceId: drivingHistory.deviceId,
        drivingHistoryId: drivingHistory._id,
      });

      await accident.save();

      // Add the new accident to the driving history
      drivingHistory.accidents.push(accident._id);
      await drivingHistory.save();

      // Return updated driving history with populated data
      await drivingHistory.populate([
        { path: "accidents" },
        { path: "riskyBehaviours" },
      ]);

      // Send notifications to emergency contacts
      notificationService
        .sendAccidentNotifications(req.user._id, accident)
        .catch((error) => {
          console.error("Error sending accident notifications:", error);
        });

      res.status(200).json(accident);
    } catch (error) {
      console.error("Add accident error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Add a risky behavior to a driving history
  async addRiskyBehaviour(req, res) {
    try {
      const { behaviourType, alertTypeName, detectedTime } = req.body;

      if (!behaviourType || !alertTypeName) {
        return res.status(400).json({
          message: "Behaviour type and alert type are required",
        });
      }

      // Find the driving history
      const drivingHistory = await DrivingHistory.findOne({
        _id: req.params.historyId,
        userId: req.user._id,
      });

      if (!drivingHistory) {
        return res.status(404).json({ message: "Driving history not found" });
      }

      // Create a new risky behavior record
      const riskyBehaviour = new RiskyBehaviour({
        behaviourType,
        alertTypeName,
        detectedTime: detectedTime || Date.now(),
        userId: req.user._id,
        deviceId: drivingHistory.deviceId,
      });

      await riskyBehaviour.save();

      // Add the new risky behavior to the driving history
      drivingHistory.riskyBehaviours.push(riskyBehaviour._id);
      await drivingHistory.save();

      // Return updated driving history with populated data
      await drivingHistory.populate([
        { path: "accidents" },
        { path: "riskyBehaviours" },
      ]);

      res.status(200).json(riskyBehaviour);
    } catch (error) {
      console.error("Add risky behaviour error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get AI-generated driving tips
  async getDrivingTips(req, res) {
    try {
      const { historyId } = req.params;
      let data = { stats: {}, riskyBehaviours: [], accidents: [] };

      // If specific history ID is provided, get that single driving history
      if (historyId) {
        const drivingHistory = await DrivingHistory.findOne({
          _id: historyId,
          userId: req.user._id,
        }).populate([{ path: "accidents" }, { path: "riskyBehaviours" }]);

        if (!drivingHistory) {
          return res.status(404).json({ message: "Driving history not found" });
        }

        // Calculate driving time in minutes
        const drivingTime =
          (new Date(drivingHistory.endTime) -
            new Date(drivingHistory.startTime)) /
          (1000 * 60);

        data = {
          drivingHistory,
          riskyBehaviours: drivingHistory.riskyBehaviours || [],
          accidents: drivingHistory.accidents || [],
          stats: {
            totalTrips: 1,
            totalDistance: drivingHistory.distanceDriven || 0,
            totalDrivingTime: drivingTime,
          },
        };
      }
      // Otherwise get overall driving statistics
      else {
        // Get the date range to analyze
        const { startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        // Get aggregate statistics
        const aggregateStats = await DrivingHistory.aggregate([
          {
            $match: {
              userId: req.user._id,
              ...(startDate || endDate ? { startTime: dateFilter } : {}),
            },
          },
          {
            $group: {
              _id: null,
              totalTrips: { $sum: 1 },
              totalDistance: { $sum: "$distanceDriven" },
              totalDrivingTime: {
                $sum: {
                  $divide: [{ $subtract: ["$endTime", "$startTime"] }, 60000], // ms to minutes
                },
              },
            },
          },
        ]);

        // Get all risky behaviors
        const riskyBehaviours = await RiskyBehaviour.find({
          userId: req.user._id,
          ...(startDate || endDate ? { detectedTime: dateFilter } : {}),
        });

        // Get all accidents
        const accidents = await Accident.find({
          userId: req.user._id,
          ...(startDate || endDate ? { detectedTime: dateFilter } : {}),
        });

        data = {
          stats: aggregateStats[0] || {
            totalTrips: 0,
            totalDistance: 0,
            totalDrivingTime: 0,
          },
          riskyBehaviours,
          accidents,
        };
      }

      // Call Gemini API to generate driving tips
      const tips = await geminiService.generateDrivingTips(data);

      res.status(200).json({
        drivingSummary: {
          totalTrips: data.stats.totalTrips,
          totalDistance: data.stats.totalDistance,
          totalDrivingTime: data.stats.totalDrivingTime,
          riskyBehavioursCount: data.riskyBehaviours.length,
          accidentsCount: data.accidents.length,
        },
        drivingTips: tips,
      });
    } catch (error) {
      console.error("Generate driving tips error:", error);
      res.status(500).json({
        message: "Error generating driving tips",
        error: error.message,
      });
    }
  }
}

// Create instance and bind methods
const drivingHistoryController = new DrivingHistoryController();
module.exports = {
  createDrivingHistory: drivingHistoryController.createDrivingHistory.bind(
    drivingHistoryController
  ),
  getUserDrivingHistories:
    drivingHistoryController.getUserDrivingHistories.bind(
      drivingHistoryController
    ),
  getDrivingHistoryById: drivingHistoryController.getDrivingHistoryById.bind(
    drivingHistoryController
  ),
  updateDrivingHistory: drivingHistoryController.updateDrivingHistory.bind(
    drivingHistoryController
  ),
  deleteDrivingHistory: drivingHistoryController.deleteDrivingHistory.bind(
    drivingHistoryController
  ),
  addAccident: drivingHistoryController.addAccident.bind(
    drivingHistoryController
  ),
  addRiskyBehaviour: drivingHistoryController.addRiskyBehaviour.bind(
    drivingHistoryController
  ),
  getDrivingTips: drivingHistoryController.getDrivingTips.bind(
    drivingHistoryController
  ),
};
