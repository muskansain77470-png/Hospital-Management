const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');

/**
 * @desc    User Story 1: Get Doctor Dashboard with Dynamic Stats
 * @route   GET /doctor/dashboard
 */
exports.getDoctorDashboard = async (req, res) => {
    try {
        const query = { doctor: req.user._id };

        // 1. Unique patients count (User Story 3 context)
        const activePatients = await Appointment.distinct('patient', query);

        // 2. Pending & Scheduled appointments (User Story 1 criteria)
        const pendingCount = await Appointment.countDocuments({ 
            ...query,
            status: { $in: ['Pending', 'Confirmed'] } 
        });

        // 3. Today's total appointments
        const totalAppointments = await Appointment.countDocuments(query);

        // 4. Recent Appointments with patient and role info
        const recentAppointments = await Appointment.find(query)
            .populate('patient', 'name email gender') 
            .sort({ createdAt: -1 })
            .limit(5);

        res.render('doctor', { 
            user: req.user,
            roleName: 'Doctor',
            stats: {
                activePatients: activePatients.length || 0,
                pending: pendingCount || 0,
                total: totalAppointments || 0
            },
            recentAppointments: recentAppointments || []
        });
    } catch (error) {
        console.error("Dashboard Error:", error.message);
        res.status(500).render('error', { message: "Dashboard load nahi ho saka." });
    }
};

/**
 * @desc    User Story 1: View Daily Appointments (Acceptance Criteria 1)
 * @route   GET /appointments
 */
exports.getDoctorAppointments = async (req, res) => {
    try {
        // Doctor ke liye unke specific, staff ke liye hospital ke saare
        const query = req.user.role === 'doctor' ? { doctor: req.user._id } : {};

        const appointments = await Appointment.find(query)
            .populate('patient', 'name email phone gender')
            .sort({ date: 1, time: 1 }); // Date wise sorting
        
        res.render('doctor/appointments', { 
            user: req.user, 
            appointments: appointments || [] 
        });
    } catch (error) {
        res.status(500).render('error', { message: "Appointments load nahi ho sake." });
    }
};

/**
 * @desc    User Story 2: Add Prescription (Acceptance Criteria 1 & 2)
 * @route   POST /api/doctor/prescription
 */
exports.addPrescription = async (req, res) => {
    try {
        const { appointmentId, patientId, medicines, instructions, diagnosis } = req.body;

        if(!appointmentId || !patientId) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        // Create Prescription Record
        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: patientId,
            medicines, // Array of {name, dosage, frequency}
            instructions,
            diagnosis
        });

        // Mark appointment as 'Completed' (Acceptance Criteria 3)
        await Appointment.findByIdAndUpdate(appointmentId, { 
            status: 'Completed',
            prescription: prescription._id 
        });

        res.status(201).json({ 
            success: true, 
            message: "Prescription saved and appointment completed successfully.",
            data: prescription 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    User Story 1: Accept/Reject Appointments (Acceptance Criteria 2)
 * @route   PUT /api/doctor/appointments/:id/status
 */
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.status(200).json({ success: true, message: `Appointment ${status}` });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * @desc    User Story 3: View Patient Medical History
 * @route   GET /doctor/patient/:id/history
 */
exports.getPatientHistory = async (req, res) => {
    try {
        const patientId = req.params.id;

        // Fetch all previous visits and prescriptions
        const history = await Appointment.find({ patient: patientId })
            .populate('doctor', 'name')
            .populate('prescription')
            .sort({ date: -1 });

        const patientInfo = await User.findById(patientId).select('name email gender phone');

        res.render('doctor/patient-history', { 
            user: req.user, 
            patient: patientInfo,
            history 
        });
    } catch (error) {
        res.status(500).render('error', { message: "Could not fetch history" });
    }
};