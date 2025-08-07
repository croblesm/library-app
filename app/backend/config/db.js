const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: __dirname + '/.env' });

let sequelize;

const connectionString = process.env.DB_CONNECTION_STRING;

function isAdoNetFormat(str) {
    return str && str.includes('Data Source=');
}

if (connectionString) {
    // Use Fabric SQL Database with Entra ID authentication
    const { DefaultAzureCredential } = require('@azure/identity');

    // Helper to parse ADO.NET connection string to config object
    function parseConnectionString(connStr) {
        const config = {};
        connStr.split(';').forEach(part => {
            const [key, ...rest] = part.split('=');
            if (key && rest.length) {
                config[key.trim().toLowerCase()] = rest.join('=').trim();
            }
        });
        if (!config['server'] && config['data source']) {
            config['server'] = config['data source'];
        }
        return config;
    }

    async function getAccessToken() {
        const credential = new DefaultAzureCredential();
        const scope = 'https://database.windows.net//.default';
        const tokenResponse = await credential.getToken(scope);
        return tokenResponse.token;
    }

    async function createSequelizeWithToken() {
        const poolConfig = {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        };
        if (isAdoNetFormat(connectionString)) {
            // ADO.NET format
            const cfg = parseConnectionString(connectionString);
            if (!cfg['server']) {
                throw new Error('Could not find "server" or "data source" in your connection string.');
            }
            const serverParts = cfg['server'].replace('tcp:', '').split(',');
            const accessToken = await getAccessToken();
            return new Sequelize(cfg['initial catalog'], null, null, {
                host: serverParts[0],
                port: parseInt(serverParts[1]) || 1433,
                dialect: 'mssql',
                pool: poolConfig,
                dialectOptions: {
                    authentication: {
                        type: 'azure-active-directory-access-token',
                        options: {
                            token: accessToken
                        }
                    },
                    options: {
                        encrypt: true,
                        trustServerCertificate: cfg['trust server certificate'] === 'True',
                        requestTimeout: (parseInt(cfg['connect timeout']) || 30) * 1000
                    }
                },
                logging: false
            });
        } else {
            // URL format (for Sequelize CLI)
            return new Sequelize(connectionString, {
                dialect: 'mssql',
                pool: poolConfig,
                dialectOptions: {
                    encrypt: true,
                    trustServerCertificate: false,
                    authentication: {
                        type: 'azure-active-directory-default'
                    }
                },
                logging: false
            });
        }
    }

    // Export a promise that resolves to the sequelize instance
    let getSequelize;

    getSequelize = async () => {
        return await createSequelizeWithToken();
    };
    module.exports = { getSequelize };

} else {
    // Fallback: use local SQL Server config (legacy mode)
    sequelize = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_SERVER && process.env.DB_SERVER.includes(',') ? process.env.DB_SERVER.split(',')[0] : process.env.DB_SERVER,
            port: process.env.DB_SERVER && process.env.DB_SERVER.includes(',') ? parseInt(process.env.DB_SERVER.split(',')[1], 10) : undefined,
            dialect: 'mssql',
            dialectOptions: {
                encrypt: true,
                trustServerCertificate: true
            },
            logging: false
        }
    );
    let getSequelize;

    getSequelize = async () => sequelize;
    module.exports = { getSequelize };
}