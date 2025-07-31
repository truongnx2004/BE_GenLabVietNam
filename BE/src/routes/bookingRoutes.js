const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Tạo booking mới
router.post('/create', bookingController.createBooking);

// Lấy danh sách booking hoặc chi tiết 1 booking
router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);

// ✅ Cập nhật toàn bộ đơn (địa chỉ, giờ, v.v.)
router.put("/:id", bookingController.updateBooking);

// Lấy giá tiền đơn
router.get("/:id/price", bookingController.getBookingPrice);

module.exports = router;
