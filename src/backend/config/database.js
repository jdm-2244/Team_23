const mysql = require('mysql2/promise');

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('Actual test: Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });

// In database.js
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    // Test a simple query
    return connection.query('SELECT 1 as test')
      .then(([rows]) => {
        console.log('Database query test successful:', rows);
        connection.release();
      });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

module.exports = pool;