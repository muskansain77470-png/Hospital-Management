const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Analgesic', 'Antibiotic', 'Antipyretic', 'Antiseptic', 'Other'],
        default: 'Other'
    },
    stockLevel: {
        type: Number,
        required: [true, 'Stock level is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        default: 'In Stock'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Middleware to automatically set status based on stockLevel before saving
medicineSchema.pre('save', function(next) {
    if (this.stockLevel === 0) {
        this.status = 'Out of Stock';
    } else if (this.stockLevel <= 15) {
        this.status = 'Low Stock';
    } else {
        this.status = 'In Stock';
    }
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('Medicine', medicineSchema);