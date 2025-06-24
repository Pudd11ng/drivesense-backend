const RiskyBehaviour = require("../models/RiskyBehaviour");

// Validate risky behaviour input
const validateRiskyBehaviourInput = (req, res, next) => {
  // For creating a new risky behaviour
  if (req.method === "POST") {
    const { detectedTime, behaviourType, alertTypeName } = req.body;

    if (!detectedTime || !behaviourType || !alertTypeName) {
      return res.status(400).json({
        message: "Detected time, behaviour type, and alert type are required",
      });
    }

    // Validate detectedTime is a valid date
    if (detectedTime && isNaN(new Date(detectedTime).getTime())) {
      return res.status(400).json({
        message: "Invalid date format for detectedTime",
      });
    }
  }

  // For updating an existing risky behaviour
  if (req.method === "PUT") {
    const { behaviourType, alertTypeName, detectedTime } = req.body;

    if (!behaviourType && !alertTypeName && !detectedTime) {
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
  }

  next();
};

// Check risky behaviour ownership
const checkRiskyBehaviourOwnership = async (req, res, next) => {
  try {
    const behaviourId = req.params.behaviourId;

    // Find the risky behaviour entry
    const riskyBehaviour = await RiskyBehaviour.findById(behaviourId);

    // Check if it exists
    if (!riskyBehaviour) {
      return res.status(404).json({ message: "Risky behaviour not found" });
    }

    // Check if it belongs to the authenticated user
    if (riskyBehaviour.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You don't own this record",
      });
    }

    // Add the risky behaviour to the request object
    req.riskyBehaviour = riskyBehaviour;
    next();
  } catch (error) {
    console.error("Risky behaviour ownership check error:", error);
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
    return res
      .status(400)
      .json({ message: "startDate cannot be after endDate" });
  }

  next();
};

module.exports = {
  validateRiskyBehaviourInput,
  checkRiskyBehaviourOwnership,
  validateDateRange,
};
