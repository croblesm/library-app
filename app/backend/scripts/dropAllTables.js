const fs = require('fs');
const path = require('path');
const { getSequelize } = require('../config/db');

async function runSqlScript(scriptPath) {
  const sequelize = await getSequelize();
  const sql = fs.readFileSync(scriptPath, 'utf8');
  await sequelize.query(sql);
  await sequelize.close();
}

runSqlScript(path.join(__dirname, './20250514040000-drop-tables.sql'))
  .then(() => console.log('Script executed successfully.'))
  .catch(err => console.error('Error executing script:', err));
