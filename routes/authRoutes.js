const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    logoutUser 
} = require('../controllers/authController');

// ==========================================
// VIEW ROUTES (To Render EJS Pages)
// ==========================================

/**
 * @route   GET /signup
 * @desc    Render the signup page
 */
router.get('/signup', (req, res) => {
    const role = req.query.role || 'patient'; // Landing page se role uthayega
    res.render('auth/signup', { role, layout: false });
});

/**
 * @route   GET /login
 * @desc    Render the login page
 */
router.get('/login', (req, res) => {
    const role = req.query.role || 'patient';
    res.render('auth/login', { role, layout: false });
});


// ==========================================
// API ROUTES (To Handle Logic)
// ==========================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/logout
 * @desc    Clear cookie and redirect
 */
router.get('/logout', logoutUser);

module.exports = router;