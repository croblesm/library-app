const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Use this if you're on Azure SQL
        enableArithAbort: true,
        trustServerCertificate: true // Add this line
    }
};

sql.connect(config, err => {
    if (err) console.log(err);
    console.log(`Connected to database: ${process.env.DB_DATABASE}`);
});

module.exports = sql;