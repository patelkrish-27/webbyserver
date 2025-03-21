const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookings.controller');

// Create booking
router.post('/bookings', bookingController.createBooking);

// Get all bookings
router.get('/bookings', bookingController.getAllBookings);

// Get booking by ID
router.get('/bookings/:id', bookingController.getBookingById);

router.get('/userbookings/:id', bookingController.fetchUserBookings);
// Update booking
router.put('/bookings/:id', bookingController.updateBooking);

// Delete booking
router.delete('/bookings/:id', bookingController.deleteBooking);
router.get('/populated', bookingController.getPopulated);

module.exports = router;
