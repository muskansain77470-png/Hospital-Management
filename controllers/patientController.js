const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');

// @desc    Dashboard: Show patient's overview
// @route   GET /patient/dashboard
exports.getPatientDashboard = async (req, res) => {
    try {
        const query = { patient: req.user._id };

        const [appointments, prescriptions, notifications] = await Promise.all([
            Appointment.find(query)
                .populate('doctor', 'name')
                .sort({ date: 1, time: 1 })
                .limit(5),
            Prescription.find(query)
                .populate('doctor', 'name'),
            Notification.find({ patient: req.user._id, isRead: false }).sort({ createdAt: -1 })
        ]);

        res.render('patients/dashboard', { 
            user: req.user, 
            appointments: appointments || [],
            prescriptions: prescriptions || [],
            notifications: notifications || [], 
            title: 'Patient Dashboard',
            roleName: 'Patient'
        });

        if (notifications.length > 0) {
            await Notification.updateMany(
                { patient: req.user._id, isRead: false },
                { $set: { isRead: true } }
            );
        }
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).render('error', { message: "Could not load dashboard data" });
    }
};

// @desc    User Story 4: Show booking page
exports.getBookingPage = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name email');
        
        /**
         * FIXED: Aapke folder structure ke hisaab se path 'appointments/book' hona chahiye.
         * VS Code sidebar check karein: views > appointments > book.ejs
         */
        res.render('appointments/book', { 
            user: req.user, 
            doctors,
            title: 'Book Appointment',
            error: req.query.error || null 
        });
    } catch (error) {
        console.error("Booking Page Error:", error);
        res.status(500).render('error', { message: "Could not load booking page" });
    }
};

// @desc    User Story 4: Process the appointment booking
exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;

        if (!doctorId || !date || !time) {
            return res.redirect('/patient/book?error=Please fill all required fields');
        }

        const existingAppointment = await Appointment.findOne({ 
            doctor: doctorId, 
            date, 
            time,
            status: { $ne: 'Cancelled' } 
        });

        if (existingAppointment) {
            return res.redirect('/patient/book?error=This time slot is already booked.');
        }

        await Appointment.create({
            patient: req.user._id, 
            doctor: doctorId,
            date,
            time,
            reason,
            status: 'Pending'
        });

        res.redirect('/patient/dashboard'); 
    } catch (error) {
        console.error("Booking Error:", error);
        res.status(400).render('error', { message: error.message });
    }
};

// @desc    User Story 5: View medical records & history
exports.getMedicalHistory = async (req, res) => {
    try {
        const [history, prescriptions] = await Promise.all([
            Appointment.find({ patient: req.user._id })
                .populate('doctor', 'name')
                .sort({ date: -1 }),
            Prescription.find({ patient: req.user._id })
                .populate('doctor', 'name')
                .sort({ createdAt: -1 })
        ]);

        res.render('patients/history', { 
            user: req.user, 
            history,
            prescriptions,
            title: 'My Medical Records'
        });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).render('error', { message: error.message });
    }
};