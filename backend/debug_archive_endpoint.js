const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');

const app = express();
const pool = require('./db');

// Session middleware (same as main server)
app.use(session({
  secret: 'museum-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Test endpoint to check session and admin access
app.get('/debug/session', (req, res) => {
  console.log('🔍 Session debug:', req.session);
  console.log('🔍 User in session:', req.session?.user);
  
  res.json({
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    user: req.session?.user,
    isAdmin: req.session?.user?.role === 'admin'
  });
});

// Test archive access
app.get('/debug/archives', async (req, res) => {
  try {
    // Check if user is admin
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        session: req.session,
        user: req.session?.user
      });
    }
    
    // Get archives
    const [archives] = await pool.query('SELECT * FROM archives ORDER BY created_at DESC');
    
    res.json({
      success: true,
      message: 'Archive access successful',
      count: archives.length,
      archives: archives
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

app.listen(3001, () => {
  console.log('🔍 Debug server running on http://localhost:3001');
  console.log('📋 Test endpoints:');
  console.log('   GET /debug/session - Check session status');
  console.log('   GET /debug/archives - Test archive access');
});
