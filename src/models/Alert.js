const mongoose = require("mongoose");

const VALID_BEHAVIORS = ['Drowsiness', 'Distraction', 'Phone Usage', 'Intoxication'];

const alertSchema = new mongoose.Schema({
  alertTypeName: {
    type: String,
    required: true,
    trim: true,
  },
  musicPlayList: {
    type: Map,
    of: new mongoose.Schema({
      name: String,
      path: String
    }, { _id: false }),
    required: true,
    default: {},
  },
  audioFilePath: {
    type: Map,
    of: new mongoose.Schema({
      name: String,
      path: String
    }, { _id: false }),
    required: true,
    default: {},
  },
  // Associate with a user
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
alertSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Alert", alertSchema);