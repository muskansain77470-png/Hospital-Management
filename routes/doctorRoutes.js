const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    getDoctorDashboard, 
    addPrescription,
    updateStatus,
    getPatientsList,
    getPharmacy,
    addMedicine,
    addPatient // <--- Ensure this is being imported!
} = require('../controllers/doctorController');

// 🔐 MIDDLEWARE
router.use(protect);
router.use(authorize('doctor', 'staff'));

// --- Main Navigation Routes ---
router.get('/dashboard', getDoctorDashboard);
router.get('/patients', getPatientsList);
router.get('/pharmacy', getPharmacy);

// --- Patient Logic ---
// Line 26: This was causing the crash because addPatient was undefined
router.post('/patients/add', addPatient); 

// --- Pharmacy Logic ---
router.post('/pharmacy/add', addMedicine); 

// --- Schedules ---
router.get('/schedules', getDoctorDashboard); 

// --- Prescription Views & Logic ---
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

router.post('/prescribe', addPrescription);

router.patch('/status/:id', updateStatus); 

module.exports = router;