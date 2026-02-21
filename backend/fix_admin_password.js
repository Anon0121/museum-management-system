const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing admin password...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });
    
    await connection.query('USE museosmart');
    
    // Hash the password properly
    const plainPassword = 'Anon13216.';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    console.log('🔐 Generated hash:', hashedPassword);
    
    // Update the admin account with proper hash
    await connection.query(
      'UPDATE system_user SET password = ? WHERE username = ?',
      [hashedPassword, 'Anon']
    );
    
    console.log('✅ Admin password fixed successfully!');
    console.log('🔑 You can now login with:');
    console.log('   Username: Anon');
    console.log('   Password: Anon13216.');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error fixing password:', error.message);
  }
}

fixAdminPassword();
