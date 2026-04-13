const Billing = require('../models/Billing');

exports.createInvoice = async (req, res) => {
    const { patient, appointment, items } = req.body;
    
    // Calculate total amount from items array
    const amount = items.reduce((acc, item) => acc + item.cost, 0);
    
    const invoice = await Billing.create({
        patient,
        appointment,
        items,
        amount
    });
    res.status(201).json(invoice);
};