const express = require('express');
const router = express.Router();

// Is line ko dhyan se check karein - path bilkul yahi hona chahiye
const { getAdminStats, getAllDoctors, deleteUser } = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminStats);
router.get('/doctors', getAllDoctors);
router.delete('/user/:id', deleteUser);

module.exports = router;