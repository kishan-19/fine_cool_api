const { body } = require("express-validator");
const { validateRequest } = require("../middlewares/errorHandler");

const sendNotification = [
  body("token").notEmpty().withMessage("token is required").bail(),
  body("title").notEmpty().withMessage("title is required").bail(),
  body("body").notEmpty().withMessage("body is required").bail(),
  validateRequest,
];

const sendAllUserNotification = [
  body("title").notEmpty().withMessage("title is required").bail(),
  body("body").notEmpty().withMessage("body is required").bail(),
  validateRequest,
];

module.exports = { sendNotification, sendAllUserNotification };
