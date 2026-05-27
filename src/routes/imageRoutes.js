const express = require("express");
const router = express.Router();

const { resizeImage } = require("../controllers/imageController");

router.get("/assets/uploads/:image", resizeImage);

module.exports = router;