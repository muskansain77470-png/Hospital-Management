const express = require('express');
const router = express.Router();
// Controller functions import
const { 
    getBookingPage, 
    bookAppointment, 
    getMedicalHistory 
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 🔐 MIDDLEWARE
 * Sabhi routes ke liye login (protect) hona zaroori hai.
 * Sirf 'patient' role hi in pages ko access kar sakta hai.
 */
router.use(protect);
router.use(authorize('patient'));

// --- USER STORY 4: BOOK APPOINTMENT ---

/**
 * @route   GET /patients/book
 * @desc    Renders the booking form with a list of available doctors
 */
router.get('/book', getBookingPage);

/**
 * @route   POST /patients/book
 * @desc    Handles the appointment booking submission
 */
router.post('/book', bookAppointment);


// --- USER STORY 5: VIEW MEDICAL RECORDS ---

/**
 * @route   GET /patients/history
 * @desc    Renders the patient's past appointments and prescriptions
 */
router.get('/history', getMedicalHistory);

/**
 * @route   GET /patients/profile
 * @desc    Renders the patient's personal profile view
 */
router.get('/profile', (req, res) => {
    res.render('patients/patient', { 
        user: req.user,
        title: 'My Profile'
    });
});

module.exports = router;