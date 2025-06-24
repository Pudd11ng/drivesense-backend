const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const emailService = require("../services/emailService");

class AuthController {
  //register function
  async register(req, res) {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      user = new User({
        email,
        password,
        authMethod: "local",
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(201).json({
        token,
        expiresIn: 604800,
        user: {
          userId: user._id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          dateOfBirth: user.dateOfBirth || "",
          country: user.country || "",
          emergencyContactUserIds: user.emergencyContactUserIds || [],
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  //login function
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check auth method
      if (user.authMethod !== "local") {
        return res.status(400).json({
          message: `This account uses ${user.authMethod} authentication. Please sign in with ${user.authMethod}.`,
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({
        token,
        expiresIn: 604800,
        user: {
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          country: user.country,
          emergencyContactUserIds: user.emergencyContactUserIds,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  //logout function
  async logout(req, res) {
    try {
      // JWT tokens are stateless, so we don't need to invalidate them server-side
      // The client should remove the token
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Google Sign In with ID Token
  async googleSignInWithToken(req, res) {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: "ID token is required" });
      }

      // Verify the Google ID token
      const { OAuth2Client } = require("google-auth-library");
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const firstName = payload["given_name"];
      const lastName = payload["family_name"];
      const email = payload["email"];
      const googleId = payload["sub"];

      // Check if user exists by Google ID
      let user = await User.findOne({ googleId });

      if (!user) {
        // Check if user exists with same email
        user = await User.findOne({ email });

        if (user) {
          // If existing account uses local auth method
          if (user.authMethod === "local") {
            return res.status(400).json({
              message:
                "An account already exists with this email. Please sign in with your password.",
            });
          } else {
            // Update existing Google user (rare case where googleId wasn't saved)
            user.googleId = googleId;
            await user.save();
          }
        } else {
          // Create new user
          user = new User({
            firstName,
            lastName,
            email,
            googleId,
            authMethod: "google",
          });

          await user.save();
        }
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({
        token,
        expiresIn: 604800,
        user: {
          userId: user._id,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email,
          dateOfBirth: user.dateOfBirth || "",
          country: user.country || "",
          emergencyContactUserIds: user.emergencyContactUserIds || [],
        },
      });
    } catch (error) {
      console.error("Google token verification error:", error);
      res
        .status(401)
        .json({ message: "Invalid Google token", error: error.message });
    }
  }

  // Request password reset
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // For security, don't reveal if user exists or not
        return res.status(200).json({
          message:
            "If your email is registered, you will receive a password reset link shortly",
        });
      }

      // Check auth method - only allow password reset for local accounts
      if (user.authMethod !== "local") {
        return res.status(400).json({
          message: `This account uses ${user.authMethod} authentication. Please sign in with ${user.authMethod}.`,
        });
      }

      // Generate reset token (random bytes converted to hex string)
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Set token and expiration in user document
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

      await user.save();

      // Send password reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        email,
        resetToken
      );

      if (emailSent) {
        res.status(200).json({
          message: "Password reset email sent successfully",
        });
      } else {
        // Reset the token if email fails
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(500).json({
          message:
            "Failed to send password reset email. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Verify reset token (optional, for checking token validity)
  async verifyResetToken(req, res) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      res.status(200).json({ message: "Token is valid" });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Reset password with token
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message: "Password must be at least 6 characters",
        });
      }

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      // Set new password
      user.password = password;

      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

// Binding methods to ensure 'this' context is preserved
const controller = new AuthController();
module.exports = {
  register: controller.register.bind(controller),
  login: controller.login.bind(controller),
  logout: controller.logout.bind(controller),
  googleSignInWithToken: controller.googleSignInWithToken.bind(controller),
  forgotPassword: controller.forgotPassword.bind(controller),
  verifyResetToken: controller.verifyResetToken.bind(controller),
  resetPassword: controller.resetPassword.bind(controller),
};
