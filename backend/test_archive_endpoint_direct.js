const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const pool = require('./db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'museum-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Test login endpoint
app.post('/test-login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [results] = await pool.query('SELECT * FROM system_user WHERE username = ?', [username]);
    
    if (results.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    const user = results[0];
    
    // Mock session for testing
    req.session.user = {
      id: user.user_ID,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      status: user.status
    };
    
    res.json({ 
      success: true, 
      user: req.session.user,
      message: 'Test login successful' 
    });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Test archives endpoint
app.get('/test-archives', async (req, res) => {
  console.log('🔍 Session data:', req.session);
  console.log('🔍 User in session:', req.session?.user);
  console.log('🔍 User role:', req.session?.user?.role);
  
  try {
    // Check if user is admin
    if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        session: req.session,
        user: req.session?.user
      });
    }
    
    // Get archives
    const [archives] = await pool.query('SELECT * FROM archives ORDER BY created_at DESC');
    
    console.log('✅ Archives retrieved successfully:', archives.length);
    
    res.json({
      success: true,
      message: 'Archive access successful',
      count: archives.length,
      archives: archives,
      user: req.session.user
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
});

app.listen(3002, () => {
  console.log('🔍 Test server running on http://localhost:3002');
  console.log('📋 Test endpoints:');
  console.log('   POST /test-login - Test admin login');
  console.log('   GET /test-archives - Test archive access');
  console.log('');
  console.log('🧪 Test with curl:');
  console.log('   curl -X POST -H "Content-Type: application/json" -d \'{"username":"Anon","password":"Anon13216."}\' http://localhost:3002/test-login -c cookies.txt');
  console.log('   curl -X GET http://localhost:3002/test-archives -b cookies.txt');
});
