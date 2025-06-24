const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
    trim: true,
  },
  deviceSSID: {
    type: String,
    required: true,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
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
deviceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Device", deviceSchema);
