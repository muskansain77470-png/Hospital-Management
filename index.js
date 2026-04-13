const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); 
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const { protect } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- VIEW ENGINE SETUP ---
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/layouts'); 

// --- MIDDLEWARE ---
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// --- PUBLIC ROUTES (GUEST) ---
app.get('/', (req, res) => res.render('index', { layout: false }));

app.get('/login', (req, res) => {
    const role = req.query.role || 'patient';
    res.render('auth/login', { layout: false, role });
});

app.get('/signup', (req, res) => {
    const role = req.query.role || 'patient'; 
    res.render('auth/signup', { layout: false, role });
});

// --- DASHBOARD REDIRECTOR ---
// Ye logic yahan isliye hai kyunki ye multiple roles ko connect karta hai
app.get('/dashboard', protect, (req, res) => {
    if (req.user.role === 'doctor') {
        return res.redirect('/doctor/dashboard');
    } else if (req.user.role === 'staff' || req.user.role === 'receptionist') {
        return res.redirect('/staff/billing'); 
    }
    
    // Default Patient Dashboard
    res.render('dashboard', { 
        user: req.user, 
        roleName: 'Patient',
        stats: { activePatients: 0, pending: 0, total: 0 },
        recentAppointments: [] 
    });
});

// --- ROUTE HANDLERS ---
// Ab saari file handling unke respective folders mein hai
app.use('/doctor', require('./routes/doctorRoutes')); // Isme /dashboard aur /prescription honge
app.use('/staff', require('./routes/staffRoutes'));   // Isme /billing hoga
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/patients', require('./routes/patientRoutes'));

// --- API ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Error Handling (Must be last)
app.use(errorHandler);

// --- SERVER START ---
const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
    console.error("❌ FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`🚀 CareSync System Online: http://localhost:${PORT}`);
});