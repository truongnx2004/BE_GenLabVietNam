const express = require("express");
const router = express.Router();
const {
  authenticateJWT,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const controller = require("../controllers/staffBookingController.js");

// Lấy tất cả bookings
router.get(
  "/booking",
  authenticateJWT,
  // Updated roles to include Manager as seen in the JSX file
  authorizeRoles("Staff", "Manager"),
  controller.getAllBookingsWithInfo
);

// Cập nhật booking theo Booking_ID
router.put(
  "/booking/:id",
  authenticateJWT,
  authorizeRoles("Staff", "Manager"),
  controller.updateBooking
);

// NEW: Upload Test Result PDF
router.post(
  "/booking/:id/upload-result",
  authenticateJWT,
  authorizeRoles("Staff", "Manager"),
  controller.uploadMiddleware, // Multer middleware handles the file upload first
  controller.uploadTestResult // Controller handles DB updates
);

module.exports = router;
