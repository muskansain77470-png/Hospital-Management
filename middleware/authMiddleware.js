const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // 1. Check for token in cookies (Browser/EJS flow)
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 
    // 2. Check for token in headers (Postman/API flow)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token, redirect to login page
    if (!token) {
        return res.redirect('/login');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token and attach to request object
        // We exclude the password for security
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.redirect('/login');
        }

        /**
         * res.locals makes 'user' available in all your EJS templates 
         * automatically. You won't need to pass { user: req.user } 
         * in every res.render call anymore!
         */
        res.locals.user = req.user;

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        
        // If the token is invalid or expired, clear the cookie and redirect
        res.clearCookie('token');
        res.redirect('/login');
    }
};

// Optional: Middleware to restrict access by role (e.g., Only Staff)
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};