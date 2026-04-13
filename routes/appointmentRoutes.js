const express = require('express');
const router = express.Router();
const { 
    getAppointments, 
    createAppointment, 
    updateAppointment 
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Sabhi routes protected hain
router.use(protect);

// --- VIEW ROUTES (Browser mein page dikhane ke liye) ---

/**
 * @desc    Render the Appointment Booking Page
 * @route   GET /appointments/book
 */
router.get('/book', (req, res) => {
    // Ye check karein ki views/appointments/book.ejs file exist karti ho
    res.render('appointments/book', { 
        user: req.user,
        title: 'Book New Appointment'
    });
});

// --- API ROUTES (Data handle karne ke liye) ---

/**
 * @route   GET /appointments (Sare appointments dekhne ke liye)
 * @route   POST /appointments (Naya appointment save karne ke liye)
 */
router.route('/')
    .get(getAppointments)
    .post(createAppointment);

/**
 * @route   PUT /appointments/:id (Appointment update karne ke liye)
 */
router.route('/:id')
    .put(updateAppointment);

module.exports = router;