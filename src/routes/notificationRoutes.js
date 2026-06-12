const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const {
  sendNotification,
  sendAllUserNotification,
} = require("../validations/notificationValidation");

// Get all users
router.post(
  "/send_notification",
  sendNotification,
  notificationController.sendNotifiaction,
);
router.post(
  "/send_all_notification",
  sendAllUserNotification,
  notificationController.sendAllUserNotification,
);

module.exports = router;
