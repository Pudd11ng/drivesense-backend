const DrivingHistory = require("../models/DrivingHistory");

// Validate driving history input
const validateDrivingHistoryInput = (req, res, next) => {
  // For creating a new driving history
  if (req.method === "POST") {
    const { startTime, endTime } = req.body;
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        message: "Start time and end time are required",
      });
    }
    
    // Validate dates
    if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
      return res.status(400).json({
        message: "Invalid date format for startTime or endTime",
      });
    }
  }
  
  // For updating an existing driving history
  if (req.method === "PUT") {
    const { startTime, endTime } = req.body;
    
    // If both start and end times are provided, validate them
    if (startTime && endTime) {
      // Validate dates
      if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
        return res.status(400).json({
          message: "Invalid date format for startTime or endTime",
        });
      }
      
      // Ensure end time is after start time
      if (new Date(endTime) <= new Date(startTime)) {
        return res.status(400).json({
          message: "End time must be after start time",
        });
      }
    }
  }
  
  next();
};

// Check ownership of driving history
const checkDrivingHistoryOwnership = async (req, res, next) => {
  try {
    const historyId = req.params.historyId;
    
    // Find the driving history
    const drivingHistory = await DrivingHistory.findById(historyId);
    
    // Check if it exists
    if (!drivingHistory) {
      return res.status(404).json({ message: "Driving history not found" });
    }
    
    // Check if it belongs to the authenticated user
    if (drivingHistory.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You don't own this driving history",
      });
    }
    
    // Add the driving history to the request object
    req.drivingHistory = drivingHistory;
    next();
  } catch (error) {
    console.error("Driving history ownership check error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate date range for filtering
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(new Date(startDate).getTime())) {
    return res.status(400).json({ message: "Invalid startDate format" });
  }
  
  if (endDate && isNaN(new Date(endDate).getTime())) {
    return res.status(400).json({ message: "Invalid endDate format" });
  }
  
  // if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
  //   return res.status(400).json({ message: "startDate cannot be after endDate" });
  // }
  
  next();
};

// Validate IDs for accident and risky behavior references
const validateReferenceId = (req, res, next) => {
  const { accidentId, behaviourId } = req.body;
  
  if (req.path.includes('/accidents') && !accidentId) {
    return res.status(400).json({ message: "Accident ID is required" });
  }
  
  if (req.path.includes('/behaviours') && !behaviourId) {
    return res.status(400).json({ message: "Behaviour ID is required" });
  }
  
  next();
};

// Validate accident input
const validateAccidentInput = (req, res, next) => {
  if (req.path.includes('/accidents')) {
    const { location, contactNum, contactTime } = req.body;
    
    if (!location || !contactNum || !contactTime) {
      return res.status(400).json({
        message: "Location, contact number, and contact time are required",
      });
    }
    
    if (contactTime && isNaN(new Date(contactTime).getTime())) {
      return res.status(400).json({
        message: "Invalid date format for contactTime",
      });
    }
  }
  
  next();
};

// Validate risky behavior input
const validateRiskyBehaviourInput = (req, res, next) => {
  if (req.path.includes('/behaviours')) {
    const { behaviourType, alertTypeName } = req.body;
    
    if (!behaviourType || !alertTypeName) {
      return res.status(400).json({
        message: "Behaviour type and alert type are required",
      });
    }
  }
  
  next();
};

module.exports = {
  validateDrivingHistoryInput,
  checkDrivingHistoryOwnership,
  validateDateRange,
  validateReferenceId,
  validateAccidentInput,
  validateRiskyBehaviourInput
};