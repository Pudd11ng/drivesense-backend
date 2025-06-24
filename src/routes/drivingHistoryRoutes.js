const express = require("express");
const router = express.Router();
const drivingHistoryController = require("../controllers/drivingHistoryController");
const { authenticate } = require("../middleware/auth");
const {
  validateDrivingHistoryInput,
  checkDrivingHistoryOwnership,
  validateDateRange,
  validateReferenceId,
  validateAccidentInput,
  validateRiskyBehaviourInput
} = require("../middleware/drivingHistory");

// Create a new driving history
router.post(
  "/",
  authenticate,
  validateDrivingHistoryInput,
  drivingHistoryController.createDrivingHistory
);

// Get all user's driving histories with optional filtering
router.get(
  "/",
  authenticate,
  validateDateRange,
  drivingHistoryController.getUserDrivingHistories
);

// Get overall driving tips (no historyId)
router.get(
  "/tips",
  authenticate,
  validateDateRange,
  drivingHistoryController.getDrivingTips
);

// Get a specific driving history by ID
router.get(
  "/:historyId",
  authenticate,
  checkDrivingHistoryOwnership,
  drivingHistoryController.getDrivingHistoryById
);

// Update a driving history
router.put(
  "/:historyId",
  authenticate,
  checkDrivingHistoryOwnership,
  validateDrivingHistoryInput,
  drivingHistoryController.updateDrivingHistory
);

// Delete a driving history
router.delete(
  "/:historyId",
  authenticate,
  checkDrivingHistoryOwnership,
  drivingHistoryController.deleteDrivingHistory
);

// Add an accident to a driving history
router.post(
  "/:historyId/accidents",
  authenticate,
  checkDrivingHistoryOwnership,
  validateAccidentInput,
  drivingHistoryController.addAccident
);

// Add a risky behaviour to a driving history
router.post(
  "/:historyId/behaviours",
  authenticate,
  checkDrivingHistoryOwnership,
  validateRiskyBehaviourInput,
  drivingHistoryController.addRiskyBehaviour
);

// Get tips for a specific driving history (with historyId)
router.get(
  "/:historyId/tips",
  authenticate,
  checkDrivingHistoryOwnership,
  drivingHistoryController.getDrivingTips
);

module.exports = router;