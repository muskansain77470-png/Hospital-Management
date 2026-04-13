const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const Patient = require('../models/Patient');

/**
 * @desc    Get all appointments for billing dashboard
 * @route   GET /staff/billing
 */
exports.getBillingDashboard = async (req, res) => {
    try {
        // Fetch appointments that are completed but not yet paid (or need billing)
        const appointments = await Appointment.find()
            .populate({
                path: 'patient',
                select: 'name email phone'
            })
            .populate('doctor', 'name')
            .sort({ createdAt: -1 });

        // Fetch last 10 bills for the history table
        const recentBills = await Billing.find()
            .populate('patient', 'name')
            .limit(10)
            .sort({ createdAt: -1 });

        res.render('staff/billing', { 
            user: req.user, 
            appointments: appointments || [],
            recentBills: recentBills || [],
            title: 'Billing Management'
        });
    } catch (error) {
        console.error("Billing Dashboard Error:", error.message);
        res.status(500).render('error', { message: "Could not load billing data" });
    }
};

/**
 * @desc    Create a new bill with auto-calculations
 * @route   POST /staff/billing/create
 */
exports.createBill = async (req, res) => {
    try {
        const { appointmentId, patientId, services, costs } = req.body;

        if (!services || !costs || !appointmentId) {
            return res.status(400).render('error', { message: "At least one service and cost is required." });
        }

        // Backend fix: Normalize single inputs into arrays
        const servicesArray = Array.isArray(services) ? services : [services];
        const costsArray = Array.isArray(costs) ? costs : [costs];

        let totalAmount = 0;
        const items = servicesArray.map((name, index) => {
            const cost = parseFloat(costsArray[index]) || 0;
            totalAmount += cost; // Auto-calculate total
            return {
                serviceName: name,
                cost: cost
            };
        });

        // Create the Bill
        const newBill = await Billing.create({
            appointment: appointmentId,
            patient: patientId,
            items,
            totalAmount, // Ensure this field exists in your Billing Schema
            generatedBy: req.user._id,
            status: 'Paid',
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}` // Generating a unique invoice number
        });

        // Update Appointment Status to Paid
        await Appointment.findByIdAndUpdate(appointmentId, { 
            paymentStatus: 'Paid',
            status: 'Completed' 
        });

        // Redirect back to billing dashboard with success
        res.redirect('/staff/billing');
    } catch (error) {
        console.error("Bill Creation Error:", error.message);
        res.status(400).render('error', { message: "Failed to generate bill: " + error.message });
    }
};

/**
 * @desc    Register New Patient (AJAX compatible)
 * @route   POST /api/staff/patients/register
 */
exports.registerPatient = async (req, res) => {
    try {
        const { name, age, gender, phone, bloodGroup } = req.body;

        // Basic validation
        if (!name || !phone) {
            return res.status(400).json({ success: false, message: "Name and Phone are required." });
        }

        const existingPatient = await Patient.findOne({ phone });
        if (existingPatient) {
            return res.status(400).json({ success: false, message: "Patient already registered with this phone number." });
        }

        const patient = await Patient.create({
            name, 
            age, 
            gender, 
            phone, 
            bloodGroup,
            createdBy: req.user._id
        });

        res.status(201).json({ 
            success: true, 
            message: "Patient registered successfully!", 
            patientId: patient._id 
        });
    } catch (error) {
        console.error("Patient Registration Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};