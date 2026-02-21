// PlanetScale Database Configuration
// Replace the values below with your PlanetScale connection details

const planetscaleConfig = {
  // Get connection string from PlanetScale dashboard
  DATABASE_URL: process.env.DATABASE_URL || 'your-planetscale-connection-string-here',
  
  // Alternative: Individual components (if you prefer)
  DB_HOST: process.env.DB_HOST || 'gateway.planetscale.com',
  DB_USER: process.env.DB_USER || 'your-username',
  DB_PASSWORD: process.env.DB_PASSWORD || 'your-password',
  DB_NAME: process.env.DB_NAME || 'museum-database',
  DB_PORT: process.env.DB_PORT || '3306',
  
  // SSL configuration (required for PlanetScale)
  SSL: {
    rejectUnauthorized: false
  }
};

console.log('🌍 PlanetScale Configuration:', {
  host: planetscaleConfig.DB_HOST,
  database: planetscaleConfig.DB_NAME,
  port: planetscaleConfig.DB_PORT
});

module.exports = planetscaleConfig;
