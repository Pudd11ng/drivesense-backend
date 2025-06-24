const User = require("../models/User");
const crypto = require("crypto");

class UserController {
  async getUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({
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
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const { firstName, lastName, email, dateOfBirth, country } = req.body;

      // Create update object with only allowed fields
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
      if (country) updateData.country = country;

      // Update the user
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Generate an emergency contact invitation code
  async generateEmergencyInviteCode(req, res) {
    try {
      const userId = req.user.id;

      // Generate a random invite code
      const inviteCode = crypto.randomBytes(16).toString("hex");

      // Set the invite code and expiration in the user document
      await User.findByIdAndUpdate(userId, {
        emergencyInviteCode: inviteCode,
        emergencyInviteExpires: Date.now() + 86400000, // 24 hours
      });

      res.status(201).json({
        inviteCode,
        expiresIn: 86400, // 24 hours in seconds
      });
    } catch (error) {
      console.error("Generate emergency invite code error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Accept an emergency contact invitation
  async acceptEmergencyInvitation(req, res) {
    try {
      const inviteeId = req.user.id;
      const { inviteCode } = req.body;

      if (!inviteCode) {
        return res.status(400).json({ message: "Invitation code is required" });
      }

      // Find the user who created the invitation
      const inviter = await User.findOne({
        emergencyInviteCode: inviteCode,
        emergencyInviteExpires: { $gt: Date.now() },
      });

      if (!inviter) {
        return res
          .status(400)
          .json({ message: "Invalid or expired invitation code" });
      }

      // Prevent self-invitation
      if (inviter._id.toString() === inviteeId) {
        return res
          .status(400)
          .json({ message: "You cannot add yourself as an emergency contact" });
      }

      // Check if already an emergency contact
      if (inviter.emergencyContactUserIds.includes(inviteeId)) {
        return res
          .status(400)
          .json({
            message: "You are already an emergency contact for this user",
          });
      }

      // Add invitee as emergency contact first
      await User.findByIdAndUpdate(inviter._id, {
        $push: { emergencyContactUserIds: inviteeId },
        $unset: {
          emergencyInviteCode: "",
          emergencyInviteExpires: "",
        },
      });

      res.status(200).json({
        message: "Emergency contact relationship established successfully",
        inviterId: inviter._id,
      });
    } catch (error) {
      console.error("Accept emergency invitation error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Get a user's emergency contacts
  async getEmergencyContacts(req, res) {
    try {
      const userId = req.user.id;

      // Get the user with populated emergency contacts
      const user = await User.findById(userId).populate({
        path: "emergencyContactUserIds",
        select: "firstName lastName email dateOfBirth country",
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Format the emergency contacts for the response
      const contacts = user.emergencyContactUserIds.map((contact) => ({
        userId: contact._id,
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email,
        dateOfBirth: contact.dateOfBirth || "",
        country: contact.country || "",
        emergencyContactUserIds: contact.emergencyContactUserIds || [],
      }));

      res.status(200).json({
        contactUserIds: user.emergencyContactUserIds.map(
          (contact) => contact._id
        ),
        contacts: contacts,
      });
    } catch (error) {
      console.error("Get emergency contacts error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  // Remove an emergency contact
  async removeEmergencyContact(req, res) {
    try {
      const userId = req.user.id;
      const { contactUserId } = req.params;

      // Check if contact ID is valid
      if (!contactUserId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid contact ID format" });
      }

      // Update the user document to remove the emergency contact
      const result = await User.findByIdAndUpdate(
        userId,
        { $pull: { emergencyContactUserIds: contactUserId } },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Emergency contact removed successfully",
        remainingContactIds: result.emergencyContactUserIds,
      });
    } catch (error) {
      console.error("Remove emergency contact error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  //Register a device token for FCM notifications
  async registerDeviceToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "FCM token is required" });
      }

      // Add token if it doesn't exist
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { fcmTokens: token },
      });

      res.status(200).json({ message: "FCM token registered successfully" });
    } catch (error) {
      console.error("Register FCM token error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

  //Remove a device token
  async removeDeviceToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "FCM token is required" });
      }

      // Remove the token
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { fcmTokens: token },
      });

      res.status(200).json({ message: "FCM token removed successfully" });
    } catch (error) {
      console.error("Remove FCM token error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
}

const controller = new UserController();
module.exports = {
  getUserProfile: controller.getUserProfile.bind(controller),
  updateUserProfile: controller.updateUserProfile.bind(controller),
  generateEmergencyInviteCode:
    controller.generateEmergencyInviteCode.bind(controller),
  acceptEmergencyInvitation:
    controller.acceptEmergencyInvitation.bind(controller),
  getEmergencyContacts: controller.getEmergencyContacts.bind(controller),
  removeEmergencyContact: controller.removeEmergencyContact.bind(controller),
  registerDeviceToken: controller.registerDeviceToken.bind(controller),
  removeDeviceToken: controller.removeDeviceToken.bind(controller),
};
