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

router.use(protect);
router.use(authorize('doctor'));

// Main Navigation Routes
router.get('/dashboard', getDoctorDashboard);
router.get('/patients', getPatientsList);
router.get('/pharmacy', getPharmacy);

// Schedules (Reusing dashboard logic or separate view)
router.get('/schedules', (req, res) => {
    res.render('doctor/dashboard', { 
        user: req.user, title: 'Schedules', layout: false,
        stats: { activePatients: 0, pending: 0, total: 0 },
        recentAppointments: []
    });
});

// Prescription Logic
router.get('/prescription/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patient');
        if (!appointment) return res.status(404).send("Not Found");
        res.render('doctor/prescription', { user: req.user, appointment, title: 'Prescription', layout: false });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

router.post('/prescription', addPrescription);
router.post('/check-in/:id', updateStatus); 

module.exports = router;