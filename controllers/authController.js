const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 */
exports.registerUser = async (req, res) => {
    try {
        const { username, name, email, password, role } = req.body;
        const finalName = name || username;

        if (!finalName) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        const user = await User.create({ 
            name: finalName, 
            email, 
            password, 
            role: role ? role.toLowerCase() : 'patient' 
        });

        if (user) {
            const token = generateToken(user._id);

            // SET COOKIE
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 30 * 24 * 60 * 60 * 1000 
            });

            // Redirect for HTML forms, JSON for API
            if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                return res.redirect('/dashboard');
            }

            res.status(201).json({ 
                success: true,
                _id: user._id, 
                name: user.name, 
                role: user.role,
                token: token 
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/auth/login
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        // Compare password
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);

            // SET COOKIE
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            // FIXED: If it's a standard Form submission, redirect to dashboard
            if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                return res.redirect('/dashboard');
            }

            // For AJAX/Fetch requests
            return res.json({ 
                success: true,
                _id: user._id, 
                name: user.name,
                role: user.role,
                token: token 
            });
        } else {
            // Error handle for EJS
            if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
                return res.status(401).render('auth/login', { 
                    role: req.body.role || 'patient',
                    error: 'Invalid email or password',
                    layout: false 
                });
            }
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Logout user / Clear Cookie
 * @route   GET /api/auth/logout
 */
exports.logoutUser = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    if (req.accepts('html')) {
        res.redirect('/');
    } else {
        res.status(200).json({ message: 'Logged out successfully' });
    }
};