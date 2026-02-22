const net = require('net');

function testConnection(host, port) {
  return new Promise((resolve) => {
    console.log(`🔍 Testing connection to ${host}:${port}...`);
    
    const socket = new net.Socket();
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      console.log('✅ Connection successful!');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log('❌ Connection timeout');
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log('❌ Connection error:', err.message);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function runTests() {
  const host = 'yamabiko.proxy.rlwy.net';
  const port = 41347;
  
  const result = await testConnection(host, port);
  
  if (!result) {
    console.log('\n🔍 Troubleshooting tips:');
    console.log('1. Check if Railway MySQL service is running');
    console.log('2. Verify the connection URL is correct');
    console.log('3. Try connecting from Railway dashboard');
    console.log('4. Check if there are firewall restrictions');
  }
}

runTests();
