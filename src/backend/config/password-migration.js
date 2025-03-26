// To be placed in src/backend/config directory alongside database.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Print environment variable information for debugging
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[REDACTED]' : 'Not set');
console.log('Current working directory:', process.cwd());
console.log('Looking for .env file at:', path.resolve(__dirname, '../../../.env'));

// Configuration for database connection - should match your existing config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const saltRounds = 10;

async function migratePasswords() {
  console.log('Starting password migration...');
  console.log('Using database config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    password: dbConfig.password ? '[REDACTED]' : 'Not set'
  });
  
  // Create database connection
  let connection;
  try {
    // Try to connect with a simple test first
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the database successfully');
    
    // Test query to verify connection
    const [testRows] = await connection.query('SELECT 1 as test');
    console.log('Database connection test successful:', testRows);
    
    // First, add isVerified column if it doesn't exist
    try {
      console.log('Checking for isVerified column...');
      await connection.query(`
        SELECT isVerified FROM Users LIMIT 1
      `);
      console.log('isVerified column already exists');
    } catch (error) {
      console.log('Adding isVerified column...');
      await connection.query(`
        ALTER TABLE Users ADD COLUMN isVerified TINYINT DEFAULT 1
      `);
      console.log('isVerified column added successfully');
    }
    
    // Add verificationToken column if it doesn't exist
    try {
      console.log('Checking for verificationToken column...');
      await connection.query(`
        SELECT verificationToken FROM Users LIMIT 1
      `);
      console.log('verificationToken column already exists');
    } catch (error) {
      console.log('Adding verificationToken column...');
      await connection.query(`
        ALTER TABLE Users ADD COLUMN verificationToken VARCHAR(100) DEFAULT NULL
      `);
      console.log('verificationToken column added successfully');
    }
    
    // Get all users with their plaintext passwords
    const [users] = await connection.query('SELECT username, passwords FROM Users');
    console.log(`Found ${users.length} users to update`);
    
    // Process each user
    for (const user of users) {
      try {
        // Only hash if the password isn't already hashed (doesn't start with $2b$)
        if (!user.passwords.startsWith('$2b$')) {
          // Hash the password
          const hashedPassword = await bcrypt.hash(user.passwords, saltRounds);
          
          // Update the password in the database
          await connection.query(
            'UPDATE Users SET passwords = ? WHERE username = ?',
            [hashedPassword, user.username]
          );
          
          console.log(`Updated password for user: ${user.username}`);
        } else {
          console.log(`Password for user ${user.username} is already hashed, skipping`);
        }
      } catch (error) {
        console.error(`Failed to update password for user ${user.username}:`, error);
      }
    }
    
    console.log('Password migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the migration
migratePasswords();