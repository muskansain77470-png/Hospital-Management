const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 */
exports.registerUser = async (req, res) => {
    try {
        const { username, name, email, password, role } = req.body;
        
        // Mapping username to name if needed
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
            role: role ? role.toLowerCase() : 'patient' // Ensure lowercase for DB consistency
        });

        if (user) {
            const token = generateToken(user._id);

            // SET COOKIE: This allows the browser to stay logged in on refresh
            res.cookie('token', token, {
                httpOnly: true, // Prevents XSS attacks
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

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

        // Find user by email
        const user = await User.findOne({ email });

        // Use the matchPassword method we added to the User Model
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user._id);

            // SET COOKIE
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            res.json({ 
                success: true,
                _id: user._id, 
                name: user.name,
                role: user.role,
                token: token 
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * @desc    Logout user / Clear Cookie
 * @route   GET /api/auth/logout
 * FIXED: Added redirect for EJS frontend support
 */
exports.logoutUser = (req, res) => {
    // Clear the cookie named 'token'
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0) // Expire immediately
    });

    /**
     * If the request is from a browser (EJS), redirect to login.
     * If it's an API call, send JSON.
     */
    if (req.accepts('html')) {
        res.redirect('/login');
    } else {
        res.status(200).json({ message: 'Logged out successfully' });
    }
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};