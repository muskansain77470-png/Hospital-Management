const express = require('express');
const router = express.Router();
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
 * Sabhi staff routes ko protect aur authorize hona zaroori hai.
 */
router.use(protect);
router.use(authorize('staff', 'admin', 'receptionist'));

// --- VIEW ROUTES (Browser mein page dikhane ke liye) ---

/**
 * @route   GET /staff/billing
 * @desc    Renders billing.ejs with pending appointments and patient list
 */
router.get('/billing', getBillingDashboard);

/**
 * @route   GET /staff/patients
 * @desc    Renders patient registry view for staff
 */
router.get('/patients', (req, res) => {
    res.render('patients/patient', { 
        user: req.user,
        title: 'Patient Registry' 
    });
});


// --- ACTION / API ROUTES (Data handle karne ke liye) ---

/**
 * @route   POST /staff/billing/create
 * @desc    Process payment and generate bill
 */
router.post('/billing/create', createBill);

/**
 * @route   POST /staff/patients/register
 * @desc    Quick patient registration by staff/receptionist
 */
router.post('/patients/register', registerPatient);

module.exports = router;