const express = require('express');
const cors = require('cors');
const session = require('express-session');

// Import your existing routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const reportsRoutes = require('./routes/reports');
const bookingsRoutes = require('./routes/bookings');
const visitorsRoutes = require('./routes/visitors');
const donationsRoutes = require('./routes/donations');
const eventsRoutes = require('./routes/events');
const culturalObjectsRoutes = require('./routes/cultural-objects');
const archiveRoutes = require('./routes/archive');
const statsRoutes = require('./routes/stats');
const slotsRoutes = require('./routes/slots');
const groupWalkinLeadersRoutes = require('./routes/group-walkin-leaders');
const groupWalkinMembersRoutes = require('./routes/group-walkin-members');
const groupWalkinVisitorsRoutes = require('./routes/group-walkin-visitors');
const walkinVisitorsRoutes = require('./routes/walkin-visitors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: 'museum-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Museum Management System is running',
    timestamp: new Date().toISOString()
  });
});

// Use existing routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/visitors', visitorsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/cultural-objects', culturalObjectsRoutes);
app.use('/api/archives', archiveRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/slots', slotsRoutes);
app.use('/api/group-walkin-leaders', groupWalkinLeadersRoutes);
app.use('/api/group-walkin-members', groupWalkinMembersRoutes);
app.use('/api/group-walkin-visitors', groupWalkinVisitorsRoutes);
app.use('/api/walkin-visitors', walkinVisitorsRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🏛️ Museum Management System running on port ${PORT}`);
  console.log('🔗 Database: Railway Internal MySQL Service');
  console.log('🚀 Ready for frontend connections');
});

module.exports = app;
