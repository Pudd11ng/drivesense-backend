const mongoose = require("mongoose");

const riskyBehaviourSchema = new mongoose.Schema({
  behaviourType: {
    type: String,
    required: true,
    trim: true,
  },
  alertTypeName: {
    type: String,
    required: true,
    trim: true,
  },
  detectedTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  // Associate with a user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Optionally associate with a device //not required for now
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RiskyBehaviour", riskyBehaviourSchema);