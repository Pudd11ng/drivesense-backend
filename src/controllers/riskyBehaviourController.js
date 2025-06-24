const RiskyBehaviour = require("../models/RiskyBehaviour");

class RiskyBehaviourController {
  // Create a new risky behaviour entry
  async createRiskyBehaviour(req, res) {
    try {
      const { behaviourType, alertTypeName, detectedTime, deviceId } = req.body;    //required these fields for creation except deviceId

      // Create new entry with user association
      const riskyBehaviour = new RiskyBehaviour({
        behaviourType,
        alertTypeName,
        detectedTime: detectedTime || Date.now(),
        userId: req.user._id,
        deviceId: deviceId || null,
      });

      await riskyBehaviour.save();
      res.status(201).json(riskyBehaviour);
    } catch (error) {
      console.error("Create risky behaviour error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get all risky behaviours for a user
  async getUserRiskyBehaviours(req, res) {
    try {
      const { startDate, endDate, behaviourType } = req.query;  // Optional filters for date range and behaviour type
      
      // Build query filter
      const filter = { userId: req.user._id };
      
      // Add date range filter if provided
      if (startDate || endDate) {
        filter.detectedTime = {};
        if (startDate) filter.detectedTime.$gte = new Date(startDate);
        if (endDate) filter.detectedTime.$lte = new Date(endDate);
      }
      
      // Add behaviour type filter if provided
      if (behaviourType) filter.behaviourType = behaviourType;
      
      const riskyBehaviours = await RiskyBehaviour.find(filter).sort({ detectedTime: -1 });
      res.status(200).json(riskyBehaviours);
    } catch (error) {
      console.error("Get risky behaviours error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get a specific risky behaviour by ID
  async getRiskyBehaviourById(req, res) {
    try {
      const riskyBehaviour = await RiskyBehaviour.findOne({
        _id: req.params.behaviourId,
        userId: req.user._id,
      });

      if (!riskyBehaviour) {
        return res.status(404).json({ message: "Risky behaviour not found" });
      }

      res.status(200).json(riskyBehaviour);
    } catch (error) {
      console.error("Get risky behaviour error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Update a risky behaviour entry //Most likely this won't be used in production, but still useful for testing
  async updateRiskyBehaviour(req, res) {
    try {
      const { behaviourType, alertTypeName, detectedTime } = req.body;

      // Create update object with only provided fields
      const updateData = {};
      if (behaviourType) updateData.behaviourType = behaviourType;
      if (alertTypeName) updateData.alertTypeName = alertTypeName;
      if (detectedTime) updateData.detectedTime = new Date(detectedTime);

      // Find and update, ensuring it belongs to the user
      const riskyBehaviour = await RiskyBehaviour.findOneAndUpdate(
        { _id: req.params.behaviourId, userId: req.user._id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!riskyBehaviour) {
        return res.status(404).json({ message: "Risky behaviour not found" });
      }

      res.status(200).json(riskyBehaviour);
    } catch (error) {
      console.error("Update risky behaviour error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Delete a risky behaviour entry //Most likely this won't be used in production, but still useful for testing
  async deleteRiskyBehaviour(req, res) {
    try {
      const riskyBehaviour = await RiskyBehaviour.findOneAndDelete({
        _id: req.params.behaviourId,
        userId: req.user._id,
      });

      if (!riskyBehaviour) {
        return res.status(404).json({ message: "Risky behaviour not found" });
      }

      res.status(200).json({ message: "Risky behaviour deleted successfully" });
    } catch (error) {
      console.error("Delete risky behaviour error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

// Create instance and bind methods
const riskyBehaviourController = new RiskyBehaviourController();
module.exports = {
  createRiskyBehaviour: riskyBehaviourController.createRiskyBehaviour.bind(riskyBehaviourController),
  getUserRiskyBehaviours: riskyBehaviourController.getUserRiskyBehaviours.bind(riskyBehaviourController),
  getRiskyBehaviourById: riskyBehaviourController.getRiskyBehaviourById.bind(riskyBehaviourController),
  updateRiskyBehaviour: riskyBehaviourController.updateRiskyBehaviour.bind(riskyBehaviourController),
  deleteRiskyBehaviour: riskyBehaviourController.deleteRiskyBehaviour.bind(riskyBehaviourController),
};