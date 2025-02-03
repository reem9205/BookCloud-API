// Importing the database initialization function and the Genre model
const { initDB } = require('../Config/database');
const Genre = require('../Models/genreModel');

class genreService {
    constructor() {
        this.pool = null; // Initialize the database connection pool as null
        this.init(); // Initialize the database connection pool
    }

    /**
     * Initializes the database connection pool.
     * This method is called automatically when an instance of the service is created.
     * @returns {Promise<void>} - Returns a promise once the database connection pool is set up.
     */
    async init() {
        this.pool = await initDB(); // Initialize the database connection pool
    }

    /**
     * Fetches all genres from the database.
     * @returns {Promise<Genre[]>} - Returns an array of Genre instances.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllGenres() {
        try {
            const [rows] = await this.pool.query('SELECT * FROM genre'); // Query to fetch all genres
            return rows.map(Genre.fromRow); // Map each row to a Genre instance
        } catch (e) {
            throw new Error(`Error fetching genres: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches a specific genre by its ID.
     * @param {number} id - The ID of the genre.
     * @returns {Promise<Genre|null>} - Returns a Genre instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getGenreById(id) {
        try {
            const [rows] = await this.pool.query('SELECT * FROM genre WHERE genre_Id = ?', [id]); // Query to fetch genre by ID
            if (rows.length === 0) return null; // Return null if genre is not found
            return Genre.fromRow(rows[0]); // Convert the row to a Genre instance
        } catch (e) {
            throw new Error(`Error fetching genre by id: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches genres by a specific type (genre name).
     * @param {string} type - The name/type of the genre.
     * @returns {Promise<Genre[]>} - Returns an array of Genre instances.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getGenreByType(type) {
        try {
            // Query to fetch genres by name
            const [rows] = await this.pool.query('SELECT * FROM genre WHERE genre_name = ?', [type]);
            // Return an array of Genre instances or empty array if none found

            return rows.length === 0 ? [] : rows.map(Genre.fromRow);
        } catch (e) {
            throw new Error(`Error fetching genres by name: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Creates a new genre in the database.
     * @param {Object} genreData - The genre data, including genre name.
     * @returns {Promise<Genre>} - Returns the newly created Genre instance.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createGenre(genreData) {
        try {

            const { genre_name } = genreData; // Extract genre name from genreData

            const [rows] = await this.pool.query(`SELECT genre_Id FROM genre WHERE genre_name = ?`, [genre_name]);

            // Check if the genre was found
            if (rows.length > 0) {
                return 'already exsists'; // Username not found, return false
            }

            // Insert the genre into the database
            const [result] = await this.pool.query('INSERT INTO genre (genre_name) VALUES (?)', [genre_name]);

            console.log(result.insertId);
            return await this.getGenreById(result.insertId); // Fetch and return the newly created genre
        } catch (e) {
            throw new Error(`Error creating genre: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Updates an existing genre in the database by its ID.
     * @param {number} id - The ID of the genre to update.
     * @param {Object} genreData - The updated genre data, including genre name.
     * @returns {Promise<boolean>} - Returns true if the update was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async updateGenre(id, genreData) {
        try {
            const { genre_name } = genreData; // Extract genre name from genreData
            // Update the genre in the database
            const [genreResult] = await this.pool.query('UPDATE genre SET genre_name = ? WHERE genre_Id = ?', [genre_name, id]);

            return genreResult.affectedRows > 0; // Return true if an update occurred, otherwise false
        } catch (e) {
            throw new Error(`Error updating genre: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Checks if there are related records for a specific genre ID.
     * @param {number} authorId - The ID of the genre to check for related records.
     * @returns {Promise<boolean>} - Returns true if related records exist, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async checkForRelatedRecords(genreId) {
        try {
            // Check for related records in the `book` table
            const [rows] = await this.pool.query('SELECT * FROM bookgenre WHERE genre_Id = ?', [genreId]);
            return rows.length > 0; // Return true if related records exist, otherwise false
        } catch (e) {
            throw new Error(`Error checking for related records: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Deletes a genre by its ID, checking for related records first.
     * @param {number} id - The ID of the genre to delete.
     * @returns {Promise<boolean|string>} - Returns true if the deletion was successful,
     *  or a message if related records exist.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async deleteGenre(id) {
        try {
            // Check if there are related records for the genre
            const hasRelatedRecords = await this.checkForRelatedRecords(id);
            if (hasRelatedRecords) {
                return 'Cannot delete genre; related records exist.'; // Return message if related records are found
            }
            // Delete the genre from the database
            const [result] = await this.pool.query('DELETE FROM genre WHERE genre_Id = ?', [id]);
            return result.affectedRows > 0; // Return true if the deletion was successful, otherwise false
        } catch (e) {
            throw new Error(`Error deleting genre: ${e.message}`); // Rethrow error with additional context
        }
    }
}

module.exports = new genreService(); // Export an instance of the genreService
