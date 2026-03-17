const mysql = require('mysql2/promise');
require('dotenv').config();

const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('Database created successfully');
    
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
};

createDatabase();
