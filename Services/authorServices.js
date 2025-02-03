// Import database initialization function and Author model
const { initDB } = require('../Config/database');
const Author = require('../Models/authorModel');

// AuthorService class to handle database operations for the Author model
class authorService {
    constructor() {
        this.pool = null;
        this.init();
    }
    // Initialize the database connection
    async init() {
        this.pool = await initDB();
    }

    /**
     * Retrieve all authors from the database
     * @returns {Promise<Array<Author>>} - Array of Author instances
     */
    async getAllAuthors() {
        try {
            const [rows] = await this.pool.query('SELECT * FROM author');
            return rows.map(Author.fromRow);
        } catch (e) {
            throw new Error(`Error fetching authors: ${e.message}`);
        }
    }

    /**
     * Retrieve an author by their ID
     * @param {number} id - Author ID
     * @returns {Promise<Author|null>} - Author instance or null if not found
     */
    async getAuthorById(id) {
        try {
            const [rows] = await this.pool.query(`SELECT * FROM author WHERE author_Id = ?`, [id]);
            if (rows.length === 0) return null;  // Handle case when no author is found
            return Author.fromRow(rows[0]);
        } catch (e) {
            throw new Error(`Error fetching author by id: ${e.message}`);
        }
    }

    /**
     * Retrieve authors by their first or last name
     * @param {string} name - Author's first or last name
     * @returns {Promise<Array<Author>>} - Array of matching Author instances
     */
    async getAuthorByName(name) {
        try {
            const [rows] = await this.pool.query(`SELECT * FROM author
                 WHERE first_name = ? OR last_name = ?`,
                [name, name]);

            // If no authors found, return an empty array
            if (rows.length === 0) return [];

            // Map over the rows to create an array of Author instances
            return rows.map(Author.fromRow);
        } catch (e) {
            throw new Error(`Error fetching authors by name: ${e.message}`);
        }
    }


    /**
     * Create a new author in the database
     * @param {object} authorData - Contains first_name and last_name of the author
     * @returns {Promise<Author>} - Newly created Author instance
     */
    async createAuthor(authorData) {
        try {

            const { first_name, last_name } = authorData;

            const [rows] = await this.pool.query(`SELECT author_Id FROM author
                  WHERE  first_name  = ? and last_name = ?`, [first_name, last_name]);

            // Check if the genre was found
            if (rows.length > 0) {
                return 'already exsists'; // Username not found, return false
            }

            const [result] = await this.pool.query(`INSERT INTO author 
                (first_name, last_name) VALUES (?, ?)`,
                [first_name, last_name]);

            return await this.getAuthorById(result.insertId);  // Retrieve and return the newly created author
        } catch (e) {
            throw new Error(`Error creating author: ${e.message}`);
        }
    }


    /**
     * Update an existing author in the database
     * @param {number} id - Author ID
     * @param {object} authorData - Contains updated first_name and last_name
     * @returns {Promise<boolean>} - True if update was successful, false otherwise
     */
    async updateAuthor(id, authorData) {
        try {
            const { first_name, last_name } = authorData;
            const [authorResult] = await this.pool.query(`UPDATE author 
                SET first_name = ?, last_name = ? WHERE author_Id = ?`,
                [first_name, last_name, id]);

            return authorResult.affectedRows > 0;  // Return whether the update was successful
        } catch (e) {
            throw new Error(`Error updating author: ${e.message}`);
        }
    }

    /**
     * Check if related records exist for a given author
     * @param {number} authorId - Author ID
     * @returns {Promise<boolean>} - True if related records exist, false otherwise
     */
    async checkForRelatedRecords(authorId) {
        try {
            const [rows] = await this.pool.query(`SELECT * FROM book WHERE author_Id = ?`, [authorId]);
            return rows.length > 0;  // Return true if related records exist
        } catch (e) {
            throw new Error(`Error checking for related records: ${e.message}`);
        }
    }

    /**
     * Delete an author from the database if no related records exist
     * @param {number} id - Author ID
     * @returns {Promise<string|boolean>} - Success message or boolean if deletion was successful
     */
    async deleteAuthor(id) {
        try {
            // Check if there are related records
            const hasRelatedRecords = await this.checkForRelatedRecords(id); // Return message if there are related records
            if (hasRelatedRecords) {
                return ('Cannot delete author; related records exist.');
            }

            const [result] = await this.pool.query(`DELETE FROM author WHERE author_Id = ?`, [id]);
            return result.affectedRows > 0;  // Return whether the deletion was successful
        } catch (e) {
            throw new Error(`Error deleting author: ${e.message}`);
        }
    }
}

// Exporting authorService instance
module.exports = new authorService();
