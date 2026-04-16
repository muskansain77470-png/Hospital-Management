const express = require('express');
const router = express.Router();

// Controller functions import
const patientController = require('../controllers/patientController');

// Destructuring functions from controller
// Note: Ensure these names match EXACTLY with exports in patientController.js
const { 
    getBookingPage, 
    bookAppointment, 
    getMedicalHistory,
    getPatientDashboard 
} = patientController;

const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 🔐 MIDDLEWARE - Global protection for all patient routes
 * Ensures user is logged in AND has the role 'patient'
 */
router.use(protect);
router.use(authorize('patient'));

// --- DASHBOARD ---
// URL: /patient/dashboard
router.get('/dashboard', getPatientDashboard);

// --- BOOKING ---
// GET: Shows the form (URL: /patient/book)
router.get('/book', getBookingPage);

// POST: Processes the form submission (URL: /patient/book)
router.post('/book', bookAppointment);

// --- HISTORY ---
// URL: /patient/history
router.get('/history', getMedicalHistory);

// --- PROFILE ---
// URL: /patient/profile
router.get('/profile', (req, res) => {
    // Handling local view for profile
    res.render('patients/profile', { 
        user: req.user,
        title: 'My Profile'
        // Layout is automatically handled by express-ejs-layouts in app.js
    });
});

module.exports = router;