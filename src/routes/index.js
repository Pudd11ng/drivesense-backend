const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const deviceRoutes = require("./deviceRoutes");
const riskyBehaviourRoutes = require("./riskyBehaviourRoutes");
const accidentRoutes = require("./accidentRoutes");
const drivingHistoryRoutes = require("./drivingHistoryRoutes");
const alertRoutes = require("./alertRoutes");
const notificationRoutes = require("./notificationRoutes");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/devices", deviceRoutes);
router.use("/behaviours", riskyBehaviourRoutes);
router.use("/accidents", accidentRoutes);
router.use("/driving", drivingHistoryRoutes);
router.use("/alerts", alertRoutes);
router.use("/notifications", notificationRoutes); 

module.exports = router;