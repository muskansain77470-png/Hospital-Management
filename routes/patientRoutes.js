const express = require('express');
const router = express.Router();

// Controller functions import
const patientController = require('../controllers/patientController');

// Destructuring with fallback to prevent "Undefined" crash
const { 
    getBookingPage, 
    bookAppointment, 
    getMedicalHistory,
    getPatientDashboard 
} = patientController;

const { protect, authorize } = require('../middleware/authMiddleware');

// 🔐 MIDDLEWARE - Only patients allowed
router.use(protect);
router.use(authorize('patient'));

// --- DASHBOARD ---
// If getPatientDashboard is undefined, Express crashes. 
// Ensure this name matches exactly in patientController.js
router.get('/dashboard', getPatientDashboard);

// --- BOOKING ---
router.get('/book', getBookingPage);
router.post('/book', bookAppointment);

// --- HISTORY ---
router.get('/history', getMedicalHistory);

// --- PROFILE ---
router.get('/profile', (req, res) => {
    res.render('patients/profile', { 
        user: req.user,
        title: 'My Profile',
        layout: 'layouts/layout' // Changed to use your standard layout
    });
});

module.exports = router;