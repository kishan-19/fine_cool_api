const { body } = require("express-validator");
const { validateRequest } = require("../middlewares/errorHandler");

const addValidation = [
  body("name").notEmpty().withMessage("Please enter the name"),
  validateRequest,
];

const deleteValidation = [
  body("id").notEmpty().withMessage("Please enter the id"),
  validateRequest,
];

const detailsValidation = [
  body("job_id").notEmpty().withMessage("Please enter the job id"),
  validateRequest,
];

const jobTransferValidation = [
  body("job_id").notEmpty().withMessage("Please enter the job id"),
  body("technician_id").notEmpty().withMessage("Please enter the technician id"),
  validateRequest,
];

const addPaymentValidation = [
  body("job_id").notEmpty().withMessage("Please enter the job id"),
  body("amount").notEmpty().withMessage("Please enter the amount"),
  validateRequest,
];

module.exports = { addValidation, deleteValidation, jobTransferValidation, addPaymentValidation , detailsValidation };
