const { Pool } = require('pg');

// const credentials = {
//     user : 'postgres',
//     host : 'localhost',
//     database: 'bisine',
//     password: 'aswin',
//     port: 5432
// }

// const pool = new Pool(credentials);

const pool = new Pool({
    user: 'aswinraaj2405',
    host: 'ep-yellow-shape-36279017-pooler.ap-southeast-1.aws.neon.tech',
    database: 'bisine',
    password: '8TCxeBGHVOP3',
    port: 5432,
    ssl: {rejectUnauthorized: false},
    connect: {
      options: `project=ep-yellow-shape-36279017-pooler`,
    }// Default PostgreSQL port
    
  });
  
  pool.connect((err, client, done) => {
    if (err) {
      console.log(err);
      done();
      return;
    }
  
    console.log('Connected to database!');
    done();
  });
  
  



module.exports = pool;