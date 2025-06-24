const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Validate user profile update data
 */
const validateProfileUpdate = (req, res, next) => {
  const { email } = req.body;

  // Validate email format if provided
  if (email && !isValidEmail(email)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address" });
  }

  next();
};

/**
 * Check if user exists
 */
const userExists = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.targetUser = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Helper function to validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateProfileUpdate,
  userExists,
};
