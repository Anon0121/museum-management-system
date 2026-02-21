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

// Test current session
app.get('/check-session', (req, res) => {
  console.log('🔍 Current session:', req.session);
  console.log('🔍 Current user:', req.session?.user);
  console.log('🔍 User permissions:', req.session?.user?.permissions);
  console.log('🔍 User role in permissions:', req.session?.user?.permissions?.role);
  console.log('🔍 User role in user object:', req.session?.user?.role);
  
  res.json({
    session: req.session,
    user: req.session?.user,
    permissions: req.session?.user?.permissions,
    roleInPermissions: req.session?.user?.permissions?.role,
    roleInUser: req.session?.user?.role
  });
});

// Force login with admin
app.post('/force-login', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM system_user WHERE username = ?', ['Anon']);
    
    if (results.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    const user = results[0];
    console.log('👤 Found user:', user);
    
    // Create admin permissions (automatic)
    const permissions = {
      // User management
      'users': { allowed: true, access: 'admin' },
      'users.create': { allowed: true, access: 'admin' },
      'users.edit': { allowed: true, access: 'admin' },
      'users.delete': { allowed: true, access: 'admin' },
      'users.view': { allowed: true, access: 'admin' },
      
      // Reports
      'reports': { allowed: true, access: 'admin' },
      'reports.create': { allowed: true, access: 'admin' },
      'reports.view': { allowed: true, access: 'admin' },
      'reports.download': { allowed: true, access: 'admin' },
      'reports.delete': { allowed: true, access: 'admin' },
      
      // Archives
      'archive': { allowed: true, access: 'admin' },
      'archives': { allowed: true, access: 'admin' },
      'archive.create': { allowed: true, access: 'admin' },
      'archive.edit': { allowed: true, access: 'admin' },
      'archive.delete': { allowed: true, access: 'admin' },
      'archive.view': { allowed: true, access: 'admin' },
      
      // Add role to permissions
      role: 'admin'
    };
    
    const freshUserData = {
      id: user.user_ID,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
      status: user.status,
      profile_photo: user.profile_photo || null,
      permissions: permissions
    };
    
    console.log('🔧 Setting session with:', freshUserData);
    
    // Set session
    req.session.user = freshUserData;
    
    res.json({ 
      success: true, 
      user: freshUserData,
      message: 'Force login successful' 
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(3003, () => {
  console.log('🔍 Session test server running on http://localhost:3003');
  console.log('📋 Endpoints:');
  console.log('   GET /check-session - Check current session');
  console.log('   POST /force-login - Force admin login');
});
