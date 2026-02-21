const fs = require('fs');
const path = require('path');

// Routes that need admin access
const adminRoutes = [
  'routes/reports.js',
  'routes/promotional.js',
  'routes/donations.js',
  'routes/cultural_objects.js',
  'routes/users.js'
];

// Admin middleware to add
const adminMiddleware = `
// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    req.user = req.session.user;
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Admin access required' 
  });
};
`;

console.log('🔧 Fixing admin access across all routes...');

adminRoutes.forEach(routeFile => {
  const filePath = path.join(__dirname, routeFile);
  
  if (fs.existsSync(filePath)) {
    console.log(`📝 Processing ${routeFile}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add admin middleware after isAuthenticated middleware
    if (content.includes('const isAuthenticated') && !content.includes('const isAdmin')) {
      const isAuthenticatedEnd = content.indexOf('};', content.indexOf('const isAuthenticated')) + 2;
      content = content.slice(0, isAuthenticatedEnd) + '\n\n' + adminMiddleware + content.slice(isAuthenticatedEnd);
    }
    
    // Replace admin-only routes to use isAdmin instead of isAuthenticated
    const adminOnlyPatterns = [
      { pattern: /router\.post\('\/', isAuthenticated,/g, replacement: 'router.post(\'/\', isAdmin,' },
      { pattern: /router\.put\('\/', isAuthenticated,/g, replacement: 'router.put(\'/\', isAdmin,' },
      { pattern: /router\.delete\('\/', isAuthenticated,/g, replacement: 'router.delete(\'/\', isAdmin,' },
      { pattern: /router\.patch\('\/', isAuthenticated,/g, replacement: 'router.patch(\'/\', isAdmin,' },
      { pattern: /router\.post\('\/generate', isAuthenticated,/g, replacement: 'router.post(\'/generate\', isAdmin,' },
      { pattern: /router\.delete\('\/delete-all', isAuthenticated,/g, replacement: 'router.delete(\'/delete-all\', isAdmin,' },
      { pattern: /router\.delete\('\/:id', isAuthenticated,/g, replacement: 'router.delete(\'/:id\', isAdmin,' }
    ];
    
    adminOnlyPatterns.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${routeFile}`);
  } else {
    console.log(`⚠️  ${routeFile} not found`);
  }
});

console.log('🎉 Admin route fixes completed!');
console.log('🔄 Please restart your server to apply changes');
