const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Route POST /api/bookings/create
router.post('/create', bookingController.createBooking);

module.exports = router;
