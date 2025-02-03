// Importing required libraries
const mysql = require('mysql2/promise'); // Import mysql2 library with promise support for async/await
const dotenv = require('dotenv'); // Import dotenv to manage environment variables

// Load environment variables from .env file
dotenv.config();

// Variable to store the database connection pool
let pool;

/**
 * Initializes the MySQL database connection pool.
 * This function creates a connection pool if one does not already exist.
 * The pool provides a set of reusable connections to the database.
 * 
 * @returns {Promise<mysql.Pool>} - Returns a promise that resolves to the MySQL connection pool.
 */
const initDB = async () => {
    // Check if the pool has already been created
    if (!pool) {
        // Create a new MySQL connection pool with the specified configuration options
        pool = mysql.createPool({
            host: process.env.DB_HOST, // Database host from environment variables
            user: process.env.DB_USER, // Database user from environment variables
            password: process.env.DB_PASSWORD, // Database password from environment variables
            database: process.env.DB_NAME, // Database name from environment variables
            port: process.env.DB_PORT || 3307, // Database port, defaults to 3307 if not provided
            waitForConnections: true, // Wait for connections when pool is exhausted
            connectionLimit: 10, // Maximum number of connections in the pool
            queueLimit: 0, // No limit on the number of queued connection requests
        });

        try {
            // Test the connection by getting a connection from the pool
            await pool.getConnection();
            console.log('Successfully connected to MySQL database');
        } catch (e) {
            // Log and exit the application if the connection attempt fails
            console.error('Unable to connect to MySQL:', e);
            process.exit(1); // Exit the application with an error code
        }
    }
    return pool; // Return the initialized pool
};

// Exporting the initDB function for use in other modules
module.exports = { initDB };
