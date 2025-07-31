const express = require("express");
const router = express.Router();
const sampleController = require("../controllers/staffSampleController");

// Lấy tất cả sample
router.get("/", sampleController.getAllSamplesWithInfo);

// Cập nhật sample
router.put("/:id", sampleController.updateSample);

module.exports = router;
