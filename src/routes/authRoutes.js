const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/authController");
const { validateRegistration, validateLogin } = require("../middleware/auth");

// Login route
router.post("/login", validateLogin, authController.login);

// Direct Google Sign-In with ID token (for mobile apps)
router.post("/google/token", authController.googleSignInWithToken);

// Register route
router.post("/register", validateRegistration, authController.register);

// Logout route
router.post("/logout", authController.logout);

// Request password reset (sends email)
router.post("/forgot-password", authController.forgotPassword);

// Set new password with reset token
router.post("/reset-password", authController.resetPassword);

// Verify reset token (optional - to check if token is valid before showing reset form)
router.get("/verify-token/:token", authController.verifyResetToken);

module.exports = router;
