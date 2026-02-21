const mysql = require('mysql2/promise');

async function fixAdminPermissions() {
  try {
    console.log('🔧 Fixing admin permissions...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('USE museosmart');
    
    // Get admin user ID
    const [user] = await connection.query('SELECT user_ID FROM system_user WHERE username = ?', ['Anon']);
    const userId = user[0].user_ID;
    
    console.log('👤 Admin user ID:', userId);
    
    // Define all admin permissions
    const adminPermissions = [
      // User management
      { name: 'users', allowed: true, access: 'admin' },
      { name: 'users.create', allowed: true, access: 'admin' },
      { name: 'users.edit', allowed: true, access: 'admin' },
      { name: 'users.delete', allowed: true, access: 'admin' },
      { name: 'users.view', allowed: true, access: 'admin' },
      
      // Reports
      { name: 'reports', allowed: true, access: 'admin' },
      { name: 'reports.create', allowed: true, access: 'admin' },
      { name: 'reports.view', allowed: true, access: 'admin' },
      { name: 'reports.download', allowed: true, access: 'admin' },
      { name: 'reports.delete', allowed: true, access: 'admin' },
      
      // Bookings
      { name: 'bookings', allowed: true, access: 'admin' },
      { name: 'bookings.create', allowed: true, access: 'admin' },
      { name: 'bookings.edit', allowed: true, access: 'admin' },
      { name: 'bookings.view', allowed: true, access: 'admin' },
      { name: 'bookings.delete', allowed: true, access: 'admin' },
      { name: 'bookings.checkin', allowed: true, access: 'admin' },
      
      // Visitors
      { name: 'visitors', allowed: true, access: 'admin' },
      { name: 'visitors.create', allowed: true, access: 'admin' },
      { name: 'visitors.edit', allowed: true, access: 'admin' },
      { name: 'visitors.view', allowed: true, access: 'admin' },
      { name: 'visitors.delete', allowed: true, access: 'admin' },
      
      // Donations
      { name: 'donations', allowed: true, access: 'admin' },
      { name: 'donations.create', allowed: true, access: 'admin' },
      { name: 'donations.edit', allowed: true, access: 'admin' },
      { name: 'donations.view', allowed: true, access: 'admin' },
      { name: 'donations.delete', allowed: true, access: 'admin' },
      { name: 'donations.approve', allowed: true, access: 'admin' },
      
      // Events
      { name: 'events', allowed: true, access: 'admin' },
      { name: 'events.create', allowed: true, access: 'admin' },
      { name: 'events.edit', allowed: true, access: 'admin' },
      { name: 'events.view', allowed: true, access: 'admin' },
      { name: 'events.delete', allowed: true, access: 'admin' },
      
      // Cultural Objects
      { name: 'cultural_objects', allowed: true, access: 'admin' },
      { name: 'cultural_objects.create', allowed: true, access: 'admin' },
      { name: 'cultural_objects.edit', allowed: true, access: 'admin' },
      { name: 'cultural_objects.view', allowed: true, access: 'admin' },
      { name: 'cultural_objects.delete', allowed: true, access: 'admin' },
      
      // Archives
      { name: 'archives', allowed: true, access: 'admin' },
      { name: 'archives.create', allowed: true, access: 'admin' },
      { name: 'archives.edit', allowed: true, access: 'admin' },
      { name: 'archives.view', allowed: true, access: 'admin' },
      { name: 'archives.delete', allowed: true, access: 'admin' },
      
      // Settings
      { name: 'settings', allowed: true, access: 'admin' },
      { name: 'settings.edit', allowed: true, access: 'admin' },
      { name: 'settings.view', allowed: true, access: 'admin' },
      
      // Dashboard
      { name: 'dashboard', allowed: true, access: 'admin' },
      { name: 'dashboard.view', allowed: true, access: 'admin' },
      
      // Analytics
      { name: 'analytics', allowed: true, access: 'admin' },
      { name: 'analytics.view', allowed: true, access: 'admin' }
    ];
    
    // Clear existing permissions for this user
    await connection.query('DELETE FROM user_permissions WHERE user_id = ?', [userId]);
    console.log('🗑️  Cleared existing permissions');
    
    // Insert all admin permissions
    for (const permission of adminPermissions) {
      await connection.query(`
        INSERT INTO user_permissions (user_id, permission_name, is_allowed, access_level)
        VALUES (?, ?, ?, ?)
      `, [userId, permission.name, permission.allowed, permission.access]);
    }
    
    console.log(`✅ Created ${adminPermissions.length} admin permissions`);
    
    // Verify permissions were created
    const [check] = await connection.query('SELECT COUNT(*) as count FROM user_permissions WHERE user_id = ?', [userId]);
    console.log(`🔍 Verification: ${check[0].count} permissions found`);
    
    await connection.end();
    console.log('🎉 Admin permissions fixed successfully!');
    console.log('🔑 You now have full admin access to all features including reports!');
    
  } catch (error) {
    console.error('❌ Error fixing permissions:', error.message);
  }
}

fixAdminPermissions();
