const express = require("express");
const router = express.Router();
const accidentController = require("../controllers/accidentController");
const { authenticate } = require("../middleware/auth");
const {
  validateAccidentInput,
  checkAccidentOwnership,
  validateDateRange,
} = require("../middleware/accident");

// Create a new accident record
router.post(
  "/",
  authenticate,
  validateAccidentInput,
  accidentController.createAccident
);

// Get all user's accidents with optional filtering
router.get(
  "/",
  authenticate,
  validateDateRange,
  accidentController.getUserAccidents
);

// Get accident statistics
router.get(
  "/stats",
  authenticate,
  validateDateRange,
  accidentController.getAccidentStats
);

// Get a specific accident by ID
router.get(
  "/:accidentId",
  authenticate,
  checkAccidentOwnership,
  accidentController.getAccidentById
);

// Update an accident
router.put(
  "/:accidentId",
  authenticate,
  checkAccidentOwnership,
  validateAccidentInput,
  accidentController.updateAccident
);

// Delete an accident
router.delete(
  "/:accidentId",
  authenticate,
  checkAccidentOwnership,
  accidentController.deleteAccident
);

module.exports = router;