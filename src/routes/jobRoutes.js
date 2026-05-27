const express = require("express");
const AuthMiddleware = require("../middlewares/authMiddleware");
const jobController = require("../controllers/jobController");
const {
  addValidation,
  deleteValidation,
  jobTransferValidation,
  addPaymentValidation,
  detailsValidation,
  startJobValidation,
} = require("../validations/jobValidation");
const { upload } = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.post("/add", AuthMiddleware, addValidation, jobController.addJob);
router.post("/list", AuthMiddleware, jobController.listJobs);
router.post("/details", AuthMiddleware, detailsValidation, jobController.details);
router.post("/delete",AuthMiddleware,deleteValidation,jobController.deletejob,);
router.post("/jobTransfer", AuthMiddleware, jobTransferValidation, jobController.jobTransfer);
router.post("/addPayment", AuthMiddleware, addPaymentValidation, jobController.addPayment);
router.post("/start_job", AuthMiddleware, upload.array("image",10), startJobValidation, jobController.startJob);
router.post("/end_job", AuthMiddleware, upload.array("image",10), startJobValidation, jobController.endJob);

module.exports = router;
