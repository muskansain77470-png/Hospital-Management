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

        res.render('doctor', { 
            user: req.user,
            stats: {
                activePatients: activePatients.length || 0,
                pending: pendingCount || 0,
                total: appointments.length || 0
            },
            recentAppointments: appointments || []
        });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
    }
};

// 2. Confirm Appointment (POST)
exports.confirmAppointment = async (req, res) => {
    try {
        const { appointmentId, date, time } = req.body;
        await Appointment.findByIdAndUpdate(appointmentId, {
            date, time, status: 'Confirmed'
        });
        res.redirect('/doctor/dashboard');
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// 3. Update Status (PUT) - YE WALA MISSING THA
exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 4. View All Appointments
exports.getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user._id })
            .populate('patient', 'name email phone gender')
            .sort({ createdAt: -1 });
        res.render('doctor/appointments', { user: req.user, appointments });
    } catch (error) {
        res.status(500).render('error', { message: error.message });
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
        res.status(201).json({ success: true, message: "Prescription added!" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};