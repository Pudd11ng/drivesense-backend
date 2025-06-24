const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false,
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      // Password only required for local auth
      return this.authMethod === "local";
    },
  },
  dateOfBirth: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  authMethod: {
    type: String,
    required: true,
    enum: ["local", "google"],
    default: "local",
  },
  googleId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
  // Field for emergency contacts
  emergencyContactUserIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: [],
  },
  // Field for invitation codes
  emergencyInviteCode: {
    type: String,
    unique: true,
    sparse: true, // Only enforce uniqueness for non-null values
  },
  emergencyInviteExpires: {
    type: Date,
  },
  // Field for FCM tokens
  fcmTokens: {
    type: [String],
    default: [],
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
