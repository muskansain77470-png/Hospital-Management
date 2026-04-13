const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Bill must be linked to a patient"]
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: [true, "Bill must be linked to an appointment"]
    },
    // User Story 9: Itemized billing (Consultation, Tests, Medicines)
    items: [{
        serviceName: { type: String, required: true },
        cost: { type: Number, required: true }
    }],
    subTotal: {
        type: Number,
        required: true,
        default: 0
    },
    tax: {
        type: Number,
        default: 0 // e.g., GST or Hospital Service Tax
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    // User Story 6: Online Payment Status
    status: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Partially Paid', 'Cancelled'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Online', 'UPI', 'Pending'],
        default: 'Pending'
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Staff/Receptionist
        required: true
    },
    invoiceNumber: {
        type: String,
        unique: true
    }
}, { timestamps: true });

// Pre-save hook: Auto-calculate total amount and generate Invoice Number
billingSchema.pre('save', function(next) {
    // Calculate subTotal from items array
    this.subTotal = this.items.reduce((sum, item) => sum + item.cost, 0);
    
    // Add tax (e.g., 5%)
    this.tax = this.subTotal * 0.05;
    this.totalAmount = this.subTotal + this.tax;

    // Generate Invoice ID if not exists (e.g., INV-2026-XXXX)
    if (!this.invoiceNumber) {
        this.invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    next();
});

module.exports = mongoose.model('Billing', billingSchema);