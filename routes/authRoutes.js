const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    logoutUser // <--- Isse import karna zaroori hai
} = require('../controllers/authController');

/**
 * @route   POST /api/auth/register
 * @desc    New user registration
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user / Clear cookie
 * FIXED: Is route ke bina logout function trigger nahi ho raha tha
 */
router.get('/logout', logoutUser);

// Exporting the router
module.exports = router;