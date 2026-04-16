const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const User = require('../models/User');

// 1. Dashboard Logic
// @route   GET /doctor/dashboard
exports.getDoctorDashboard = async (req, res) => {
    try {
        const query = { doctor: req.user._id };
        
        // Fetching stats and recent appointments
        const [activePatients, pendingCount, appointments] = await Promise.all([
            Appointment.distinct('patient', query),
            Appointment.countDocuments({ ...query, status: 'Pending' }),
            Appointment.find(query)
                .populate('patient', 'name email gender age')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        res.render('doctor/dashboard', { 
            user: req.user,
            stats: {
                activePatients: activePatients.length || 0,
                pending: pendingCount || 0,
                total: appointments.length || 0
            },
            recentAppointments: appointments || [],
            title: 'Doctor Dashboard',
            layout: false // Custom dashboard layout manually handled
        });
    } catch (error) {
        console.error("Doctor Dashboard Error:", error);
        res.status(500).render('error', { message: "Dashboard load nahi ho saka: " + error.message });
    }
};

// 2. Get All Patients List
// @route   GET /doctor/patients
exports.getPatientsList = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email phone gender age')
            .sort({ createdAt: -1 });
        
        // Removing duplicates to show unique patients
        const uniquePatients = [];
        const patientIds = new Set();
        
        appointments.forEach(app => {
            if (app.patient && !patientIds.has(app.patient._id.toString())) {
                patientIds.add(app.patient._id.toString());
                uniquePatients.push(app.patient);
            }
        });

        res.render('doctor/patients', { // Path ensures it matches your views folder
            user: req.user, 
            patients: uniquePatients,
            title: 'My Patients',
            layout: false
        });
    } catch (error) {
        console.error("Patients List Error:", error);
        res.status(500).send("Patients list fetch karne mein error: " + error.message);
    }
};

// 3. Pharmacy Management View
exports.getPharmacy = (req, res) => {
    res.render('doctor/pharmacy', { 
        user: req.user, 
        title: 'Pharmacy Management', 
        layout: false 
    });
};

// 4. Update Status (AJAX Call from Doctor Dashboard)
// @route   PATCH /doctor/status/:id
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment nahi mila." });
        }

        // Only update and notify if status is actually different
        if (appointment.status !== status) {
            appointment.status = status || 'Completed';
            await appointment.save();

            // Create real-time notification for patient
            await Notification.create({
                patient: appointment.patient,
                message: `Status Update: Your appointment is now ${status.toUpperCase()}.`,
                type: status === 'Cancelled' ? 'error' : 'success'
            });
        }

        res.status(200).json({ success: true, message: "Status updated successfully", data: appointment });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// 5. Add Prescription & Close Appointment
// @route   POST /doctor/prescribe
exports.addPrescription = async (req, res) => {
    try {
        const { appointmentId, patientId, medicines, instructions, diagnosis } = req.body;

        if (!appointmentId || !patientId || !diagnosis) {
            return res.status(400).json({ success: false, message: "Diagnosis and IDs are required." });
        }
        
        // Create Prescription entry
        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: patientId,
            medicines, 
            instructions, 
            diagnosis
        });

        // Update Appointment status and link prescription
        await Appointment.findByIdAndUpdate(appointmentId, { 
            status: 'Completed', 
            prescription: prescription._id 
        });

        // Notify patient about the new prescription
        await Notification.create({
            patient: patientId,
            message: `New Medical Record: Dr. ${req.user.name} has issued a new prescription for you.`,
            type: 'info'
        });

        res.status(200).json({ success: true, message: "Prescription saved and patient notified!" });
    } catch (error) {
        console.error("Prescription Error:", error);
        res.status(400).json({ success: false, message: "Failed to save prescription: " + error.message });
    }
};