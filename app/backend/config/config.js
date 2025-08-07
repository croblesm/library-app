const { sequelize } = require('./db'); // Import your db.js configuration

const dbServer = process.env.DB_SERVER;
const dbConnectionString = process.env.DB_CONNECTION_STRING;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase = process.env.DB_DATABASE;

module.exports = {
  development: dbConnectionString
    ? {
        // Fabric SQL Database configuration
        use_env_variable: 'DB_CONNECTION_STRING',
        dialect: 'mssql',
        dialectOptions: {
          encrypt: true,
          trustServerCertificate: false,
          authentication: {
            type: 'azure-active-directory-default'
          }
        },
        logging: false
      }
    : dbServer && dbUser && dbPassword && dbDatabase
    ? {
        // Local SQL Server configuration
        username: dbUser,
        password: dbPassword,
        database: dbDatabase,
        host: dbServer.includes(',') ? dbServer.split(',')[0] : dbServer,
        port: dbServer.includes(',') ? parseInt(dbServer.split(',')[1], 10) : undefined,
        dialect: 'mssql',
        dialectOptions: {
          encrypt: true,
          trustServerCertificate: true
        },
        logging: false
      }
    : (() => { throw new Error('No valid DB configuration found. Set DB_CONNECTION_STRING for Fabric or DB_SERVER, DB_USER, DB_PASSWORD, DB_DATABASE for local development.'); })(),
  test: {
    // Add test database configuration if needed
  },
  production: {
    // Add production database configuration if needed
  }
};
