const mongoose = require("mongoose");

const accidentSchema = new mongoose.Schema({
  detectedTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  contactNum: {
    type: String,
    required: true,
    trim: true,
  },
  contactTime: {
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
accidentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Accident", accidentSchema);
