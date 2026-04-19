const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); 
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { protect } = require('./middleware/authMiddleware');

// Environment configuration and Database connection
dotenv.config();
connectDB();

const app = express();

// --- VIEW ENGINE SETUP ---
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layout'); // Global layout file

// --- MIDDLEWARE ---
/**
 * Essential for parsing JSON sent via fetch() from your billing page
 */
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); 
app.use(express.static(path.join(__dirname, 'public')));

// --- GUEST ROUTES (Landing & Auth) ---

app.get('/', (req, res) => {
    res.render('index', { layout: false }); 
});

app.get('/login', (req, res) => {
    const role = req.query.role || 'patient';
    res.render('auth/login', { layout: false, role });
});

app.get('/signup', (req, res) => {
    const role = req.query.role || 'patient';
    res.render('auth/signup', { layout: false, role });
});

// --- DASHBOARD REDIRECTOR ---
app.get('/dashboard', protect, (req, res) => {
    if (req.user.role === 'doctor') {
        return res.redirect('/doctor/dashboard');
    } 
    if (req.user.role === 'staff') {
        return res.redirect('/staff/dashboard');
    }
    if (req.user.role === 'admin') {
        return res.redirect('/admin/dashboard');
    }
    res.redirect('/patient/dashboard'); 
});

// --- ROUTE MOUNTING ---

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Protected Module Routes
app.use('/doctor', protect, require('./routes/doctorRoutes'));
app.use('/staff', protect, require('./routes/staffRoutes'));
app.use('/patient', protect, require('./routes/patientRoutes')); 
app.use('/appointments', protect, require('./routes/appointmentRoutes'));

// --- LOGOUT ---
app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// --- 404 HANDLER ---
/**
 * Catch-all for routes that don't exist
 */
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// --- ERROR HANDLING ---
/**
 * This must be the last middleware.
 * It will catch errors from your controllers and middleware.
 */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 CareSync HMS Running on: http://localhost:${PORT}`);
});