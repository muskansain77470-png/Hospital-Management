const express = require('express');
const router = express.Router();

// FIXED: Looking at your folder structure, the file is named 'Patient.js'
const Patient = require('../models/Patient'); 

// Controller functions import
const { 
    getBillingDashboard, 
    createBill, 
    registerPatient 
} = require('../controllers/staffController');

// Middleware imports
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * 🔐 MIDDLEWARE
 * Role authorization check
 */
router.use(authorize('staff', 'admin', 'receptionist'));

// --- VIEW ROUTES ---

/**
 * @route   GET /staff/dashboard
 */
router.get('/dashboard', (req, res) => {
    res.render('staff/dashboard', { 
        user: req.user,
        title: 'Staff Dashboard' 
    });
});

/**
 * @route   GET /staff/billing
 */
router.get('/billing', getBillingDashboard);

/**
 * @route   GET /staff/patients
 */
router.get('/patients', async (req, res) => {
    try {
        // Fetching from the correctly imported 'Patient' model
        const patients = await Patient.find({}).sort({ createdAt: -1 });

        res.render('patients/patient', { 
            user: req.user,
            title: 'Patient Registry',
            patients: patients 
        });
    } catch (error) {
        console.error("Error loading patients:", error);
        res.render('patients/patient', { 
            user: req.user,
            title: 'Patient Registry',
            patients: [] 
        });
    }
});


// --- ACTION / API ROUTES ---

/**
 * @route   POST /staff/billing/create
 */
router.post('/billing/create', createBill);

/**
 * @route   POST /staff/patients/register
 */
router.post('/patients/register', registerPatient);

module.exports = router;