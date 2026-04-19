const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware: Ensures the user is logged in
 */
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
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            res.clearCookie('token');
            return res.redirect('/login');
        }

        // Available in all EJS templates
        res.locals.user = req.user;

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);
        res.clearCookie('token');
        res.redirect('/login');
    }
};

/**
 * Authorize middleware: Restricts access based on roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            // Check if the request expects JSON (API/Fetch) or HTML (Browser)
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(403).json({
                    success: false,
                    message: `User role ${req.user?.role || 'Guest'} is not authorized to access this route`
                });
            }

            // For Browser/EJS: Redirect to a dashboard or show an alert
            // Instead of throwing a generic error that breaks the view engine,
            // we redirect to a safe page with a query parameter
            return res.status(403).render('error', { 
                message: "Access Denied: You do not have permission to view this page.",
                error: { status: 403 }
            });
        }
        next();
    };
};