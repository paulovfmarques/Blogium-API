const { Pool } = require('pg');

const connection = new Pool({
  user: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'blogium',
  password: 'PVFMvila123.'
});

module.exports = connection;
