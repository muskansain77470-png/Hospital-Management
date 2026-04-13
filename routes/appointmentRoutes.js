const express = require('express');
const router = express.Router();
const { 
    getBookingPage, 
    bookAppointment,
    getAppointments,
    updateAppointment 
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

// Sabhi routes protected hain
router.use(protect);

// --- VIEW ROUTES ---

/**
 * @desc    Render the Appointment Booking Page
 * @route   GET /appointments/book
 */
router.get('/book', getBookingPage);

// --- API ROUTES ---

/**
 * @route   GET /appointments (List)
 * @route   POST /appointments (Create)
 */
router.route('/')
    .get(getAppointments)
    .post(bookAppointment);

/**
 * @route   PUT /appointments/:id
 */
router.route('/:id')
    .put(updateAppointment);

module.exports = router;