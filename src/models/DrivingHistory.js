const mongoose = require("mongoose");

const drivingHistorySchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  // Associate with a user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Optional association with a device
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
  },
  // References to accidents
  accidents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accident",
    },
  ],
  // References to risky behaviors
  riskyBehaviours: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskyBehaviour",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the "updatedAt" field on save
drivingHistorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("DrivingHistory", drivingHistorySchema);
