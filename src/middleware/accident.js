const Accident = require("../models/Accident");

// Validate accident input
const validateAccidentInput = (req, res, next) => {
  // For creating a new accident
  if (req.method === "POST") {
    const { detectedTime, location, contactNum, contactTime } = req.body;

    if (!detectedTime || !location || !contactNum || !contactTime) {
      return res.status(400).json({
        message: "Location, contact number, and contact time are required",
      });
    }

    // Validate detectedTime is a valid date
    if (detectedTime && isNaN(new Date(detectedTime).getTime())) {
      return res.status(400).json({
        message: "Invalid date format for detectedTime",
      });
    }

    // Validate contactTime is a valid date
    if (contactTime && isNaN(new Date(contactTime).getTime())) {
      return res.status(400).json({
        message: "Invalid date format for contactTime",
      });
    }
  }
  
  // For updating an existing accident
  if (req.method === "PUT") {
    const { detectedTime, location, contactNum, contactTime } = req.body;
    
    if (!location && !contactNum && !contactTime && !detectedTime) {
      return res.status(400).json({
        message: "At least one field must be provided for update",
      });
    }
    
    // Validate detectedTime if provided
    if (detectedTime && isNaN(new Date(detectedTime).getTime())) {
      return res.status(400).json({
        message: "Invalid date format for detectedTime",
      });
    }
    
    // Validate contactTime if provided
    if (contactTime && isNaN(new Date(contactTime).getTime())) {
      return res.status(400).json({
        message: "Invalid date format for contactTime",
      });
    }
  }
  
  next();
};

// Check accident ownership
const checkAccidentOwnership = async (req, res, next) => {
  try {
    const accidentId = req.params.accidentId;
    
    // Find the accident entry
    const accident = await Accident.findById(accidentId);
    
    // Check if it exists
    if (!accident) {
      return res.status(404).json({ message: "Accident not found" });
    }
    
    // Check if it belongs to the authenticated user
    if (accident.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You don't own this record",
      });
    }
    
    // Add the accident to the request object
    req.accident = accident;
    next();
  } catch (error) {
    console.error("Accident ownership check error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Validate date range if provided in query params
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(new Date(startDate).getTime())) {
    return res.status(400).json({ message: "Invalid startDate format" });
  }
  
  if (endDate && isNaN(new Date(endDate).getTime())) {
    return res.status(400).json({ message: "Invalid endDate format" });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ message: "startDate cannot be after endDate" });
  }
  
  next();
};

module.exports = {
  validateAccidentInput,
  checkAccidentOwnership,
  validateDateRange,
};