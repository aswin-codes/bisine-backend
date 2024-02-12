const { Pool } = require('pg');

const credentials = {
    user : 'postgres',
    host : 'localhost',
    database: 'bisine',
    password: 'aswin',
    port: 5432
}

const pool = new Pool(credentials);


module.exports = pool;