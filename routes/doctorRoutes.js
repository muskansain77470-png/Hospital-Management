const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');

// Dashboard aur baaki controllers import karein
const { 
    getDoctorDashboard, 
    addPrescription 
} = require('../controllers/doctorController');

router.use(protect);
router.use(authorize('doctor'));

// Dashboard route
router.get('/dashboard', getDoctorDashboard);

/**
 * FIXED ROUTE: /doctor/prescription/:id
 * Agar aap browser mein ye URL hit kar rahe hain, toh ye route yahan hona chahiye
 */
router.get('/prescription/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patient');
        
        if (!appointment) {
            return res.status(404).render('error', { message: "Appointment not found" });
        }

        res.render('doctor/prescription', { 
            user: req.user, 
            appointment,
            title: 'Write Prescription'
        });
    } catch (err) {
        console.error("Route Error:", err.message);
        res.status(500).render('error', { message: "Internal Server Error" });
    }
});

// Prescription POST handle karne ke liye
router.post('/prescription', addPrescription);

module.exports = router;