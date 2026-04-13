const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); 
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();
connectDB();

const app = express();

// --- VIEW ENGINE SETUP ---
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layouts'); // Check layout path carefully

// --- MIDDLEWARE ---
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// --- GUEST ROUTES ---
app.get('/', (req, res) => res.render('index', { layout: false }));
app.get('/login', (req, res) => res.render('auth/login', { layout: false, role: req.query.role || 'patient' }));
app.get('/signup', (req, res) => res.render('auth/signup', { layout: false, role: req.query.role || 'patient' }));

// --- DASHBOARD REDIRECTOR ---
app.get('/dashboard', protect, (req, res) => {
    if (req.user.role === 'doctor') return res.redirect('/doctor/dashboard');
    if (req.user.role === 'staff') return res.redirect('/staff/billing');
    
    // Patient Dashboard (Directly render or move to a controller)
    res.render('dashboard', { 
        user: req.user, 
        roleName: 'Patient',
        stats: { activePatients: 0, pending: 0, total: 0 },
        recentAppointments: [] 
    });
});

// --- ROUTE MOUNTING ---
app.use('/doctor', require('./routes/doctorRoutes'));
app.use('/staff', require('./routes/staffRoutes'));
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 CareSync Online: http://localhost:${PORT}`));