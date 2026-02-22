console.log('🚀 Root server.js - Redirecting to emergency test...');

// Run the emergency test from backend directory
try {
  require('./backend/emergency-test.js');
} catch (error) {
  console.error('❌ Failed to run emergency test:', error.message);
  console.error('❌ Error details:', error.stack);
  process.exit(1);
}
