const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// 1. Dashboard Logic
exports.getDoctorDashboard = async (req, res) => {
    try {
        const query = { doctor: req.user._id };
        const [activePatients, pendingCount, appointments] = await Promise.all([
            Appointment.distinct('patient', query),
            Appointment.countDocuments({ ...query, status: 'Pending' }),
            Appointment.find(query)
                .populate('patient', 'name email gender')
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
            layout: false 
        });
    } catch (error) {
        res.status(500).send("Dashboard Error: " + error.message);
    }
};

// 2. Get All Patients
exports.getPatientsList = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email phone gender age');
        
        const uniquePatients = [];
        const patientIds = new Set();
        appointments.forEach(app => {
            if (app.patient && !patientIds.has(app.patient._id.toString())) {
                patientIds.add(app.patient._id.toString());
                uniquePatients.push(app.patient);
            }
        });

        res.render('patients/patient', { 
            user: req.user, 
            patients: uniquePatients,
            title: 'My Patients',
            layout: false
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// 3. Pharmacy Logic (Beautiful Page)
exports.getPharmacy = (req, res) => {
    res.render('doctor/pharmacy', { 
        user: req.user, 
        title: 'Pharmacy Management', 
        layout: false 
    });
};

// 4. Update Status (AJAX)
exports.updateStatus = async (req, res) => {
    try {
        const status = req.body.status || 'Completed';
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, { status: status }, { new: true }
        );
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 5. Add Prescription
exports.addPrescription = async (req, res) => {
    try {
        const { appointmentId, patientId, medicines, instructions, diagnosis } = req.body;
        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: patientId,
            medicines, instructions, diagnosis
        });
        await Appointment.findByIdAndUpdate(appointmentId, { 
            status: 'Completed', 
            prescription: prescription._id 
        });
        res.status(200).json({ success: true, message: "Prescription saved" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};