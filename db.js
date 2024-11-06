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
      user: 'postgres',
      host: 'database-1.cb6gyskgg2ks.ap-south-1.rds.amazonaws.com',
      database: 'postgres',
      password: 'aswin2405',
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