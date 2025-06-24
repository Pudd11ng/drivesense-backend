const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const { validateProfileUpdate } = require("../middleware/user");

// User profile routes
router.get("/profile", authenticate, userController.getUserProfile);

// Update user profile route
router.put(
  "/profile",
  authenticate,
  validateProfileUpdate,
  userController.updateUserProfile
);

// Emergency contact routes
router.post(
  "/emergency-contacts/generate-code",
  authenticate,
  userController.generateEmergencyInviteCode
);

router.post(
  "/emergency-contacts/accept",
  authenticate,
  userController.acceptEmergencyInvitation
);

router.get(
  "/emergency-contacts",
  authenticate,
  userController.getEmergencyContacts
);

router.delete(
  "/emergency-contacts/:contactUserId",
  authenticate,
  userController.removeEmergencyContact
);

// FCM token management routes
router.post("/fcm-token", authenticate, userController.registerDeviceToken);
router.delete("/fcm-token", authenticate, userController.removeDeviceToken);

module.exports = router;
