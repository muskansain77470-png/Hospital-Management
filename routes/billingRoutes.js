const express = require('express');
const router = express.Router();
const { createInvoice } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only Admins or Staff can create bills
router.post('/', protect, authorize('admin', 'staff'), createInvoice);

module.exports = router;