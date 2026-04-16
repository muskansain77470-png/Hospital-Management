const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getDoctorDashboard, 
    addPrescription,
    updateStatus,
    getPatientsList,
    getPharmacy
} = require('../controllers/doctorController');

// 🔐 MIDDLEWARE - Only Doctors allowed
router.use(protect);
router.use(authorize('doctor'));

// --- Main Navigation Routes ---
router.get('/dashboard', getDoctorDashboard);
router.get('/patients', getPatientsList);
router.get('/pharmacy', getPharmacy);

// --- Schedules ---
router.get('/schedules', getDoctorDashboard); // Reusing dashboard logic to show appointments

// --- Prescription Views & Logic ---
// 1. Show the prescription form
router.get('/prescription/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patient');
        if (!appointment) return res.status(404).send("Appointment Not Found");
        
        res.render('doctor/prescription', { 
            user: req.user, 
            appointment, 
            title: 'Write Prescription', 
            layout: false 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// 2. Process prescription submission
router.post('/prescribe', addPrescription);

// --- Status Update Logic (AJAX Compatible) ---
/**
 * FIXED: Method changed to PATCH to match standard AJAX status updates.
 * URL: /doctor/status/:id
 */
router.patch('/status/:id', updateStatus); 

module.exports = router;