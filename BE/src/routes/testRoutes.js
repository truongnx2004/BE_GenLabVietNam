// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const { calculateBookingTotal } = require('../controllers/bookingController'); // chỉnh path nếu khác

router.get('/test-total/:booking_Id', async (req, res) => {
    // Đúng param là booking_Id, nhưng lấy req.params.booking_Id (phân biệt hoa thường)
    const bookingId = req.params.booking_Id;

    // Nếu là số lớn, nên truyền vào dạng chuỗi hoặc BigInt
    if (!bookingId) {
        return res.status(400).json({ message: 'Thiếu bookingId' });
    }

    const total = await calculateBookingTotal(bookingId);
    if (total === null) {
        return res.status(404).json({ message: 'Không tìm thấy hoặc lỗi khi tính tổng tiền' });
    }

    res.json({ bookingId, total });
});

module.exports = router;
