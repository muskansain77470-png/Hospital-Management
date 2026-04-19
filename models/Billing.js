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
    // Itemized billing (Consultation, Tests, Medicines)
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
        default: 0 
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
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
        ref: 'User', 
        required: true
    },
    invoiceNumber: {
        type: String,
        unique: true
    }
}, { timestamps: true });

// ✅ FIXED: Pre-save hook for Auto-calculations
billingSchema.pre('validate', function(next) {
    // 1. Calculate subTotal from items array
    if (this.items && this.items.length > 0) {
        this.subTotal = this.items.reduce((sum, item) => sum + item.cost, 0);
    } else {
        this.subTotal = 0;
    }
    
    // 2. Add tax (5%)
    this.tax = this.subTotal * 0.05;
    
    // 3. Final Total
    this.totalAmount = this.subTotal + this.tax;

    // 4. Generate Invoice ID if not exists
    if (!this.invoiceNumber) {
        this.invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    
    next();
});

module.exports = mongoose.model('Billing', billingSchema);