const mysql = require('mysql2/promise');

async function cleanupAdminPermissions() {
  try {
    console.log('🧹 Cleaning up admin permissions...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('USE museosmart');
    
    // Get all admin users
    const [adminUsers] = await connection.query('SELECT user_ID, username FROM system_user WHERE role = ?', ['admin']);
    
    console.log(`👑 Found ${adminUsers.length} admin users`);
    
    // Remove permissions for all admin users (they now get automatic access)
    for (const admin of adminUsers) {
      await connection.query('DELETE FROM user_permissions WHERE user_id = ?', [admin.user_ID]);
      console.log(`🗑️  Removed permissions for admin: ${admin.username}`);
    }
    
    // Verify staff users still have their permissions
    const [staffUsers] = await connection.query('SELECT user_ID, username FROM system_user WHERE role = ?', ['user']);
    console.log(`👥 Found ${staffUsers.length} staff users`);
    
    for (const staff of staffUsers) {
      const [permissions] = await connection.query('SELECT COUNT(*) as count FROM user_permissions WHERE user_id = ?', [staff.user_ID]);
      console.log(`📋 Staff ${staff.username}: ${permissions[0].count} permissions`);
    }
    
    await connection.end();
    console.log('✅ Admin permissions cleanup completed!');
    console.log('🎯 Admin users now have automatic full access');
    console.log('👤 Staff users keep their specific permissions');
    
  } catch (error) {
    console.error('❌ Error cleaning up permissions:', error.message);
  }
}

cleanupAdminPermissions();
