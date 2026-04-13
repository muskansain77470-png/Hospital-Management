const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    patientDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    // FIXED: Date is no longer required at the time of booking
    date: {
        type: Date,
        required: false 
    },
    // FIXED: Time is no longer required at the time of booking
    time: {
        type: String,
        required: false
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
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Partially Paid'],
        default: 'Unpaid'
    },
    amount: {
        type: Number,
        default: 500 
    },
    prescription: {
        type: String, 
        default: ""
    },
    tokenNumber: {
        type: Number
    }
}, { timestamps: true });

// Pre-save hook to generate a random token number
appointmentSchema.pre('save', function(next) {
    if (!this.tokenNumber) {
        this.tokenNumber = Math.floor(100 + Math.random() * 900);
    }
    next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);