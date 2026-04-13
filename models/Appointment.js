const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Logged-in Patient User
        required: true
    },
    // Optional: Agar aapne Patient Registry (Story 7) use ki hai, 
    // toh aap yahan direct Patient model ko bhi link kar sakte hain
    patientDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    date: {
        type: Date,
        required: [true, "Appointment date is required"]
    },
    time: {
        type: String,
        required: [true, "Time slot is required"]
    },
    reason: {
        type: String,
        required: [true, "Reason for visit is required"],
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    // User Story 6: Billing & Payment integration
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Partially Paid'],
        default: 'Unpaid'
    },
    amount: {
        type: Number,
        default: 500 // Default consultation fee
    },
    // User Story 2: Link to Prescription after completion
    prescription: {
        type: String, // Prescription text ya PDF link
        default: ""
    },
    // Viva point: Token number hospital management ko professional banata hai
    tokenNumber: {
        type: Number
    }
}, { timestamps: true });

// Pre-save hook to generate a random token number if not provided
appointmentSchema.pre('save', function(next) {
    if (!this.tokenNumber) {
        this.tokenNumber = Math.floor(100 + Math.random() * 900);
    }
    next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);