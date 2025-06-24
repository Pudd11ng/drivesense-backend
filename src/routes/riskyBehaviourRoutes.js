const express = require("express");
const router = express.Router();
const riskyBehaviourController = require("../controllers/riskyBehaviourController");
const { authenticate } = require("../middleware/auth");
const {
  validateRiskyBehaviourInput,
  checkRiskyBehaviourOwnership,
  validateDateRange,
} = require("../middleware/riskyBehaviour");

// Create a new risky behaviour entry
router.post(
  "/",
  authenticate,
  validateRiskyBehaviourInput,
  riskyBehaviourController.createRiskyBehaviour
);

// Get all user's risky behaviours with optional filtering
router.get(
  "/",
  authenticate,
  validateDateRange,
  riskyBehaviourController.getUserRiskyBehaviours
);

// Get a specific risky behaviour by ID
router.get(
  "/:behaviourId",
  authenticate,
  checkRiskyBehaviourOwnership,
  riskyBehaviourController.getRiskyBehaviourById
);

// Update a risky behaviour
router.put(
  "/:behaviourId",
  authenticate,
  checkRiskyBehaviourOwnership,
  validateRiskyBehaviourInput,
  riskyBehaviourController.updateRiskyBehaviour
);

// Delete a risky behaviour
router.delete(
  "/:behaviourId",
  authenticate,
  checkRiskyBehaviourOwnership,
  riskyBehaviourController.deleteRiskyBehaviour
);

module.exports = router;