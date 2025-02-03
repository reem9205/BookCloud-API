// Importing database initialization function and the Image model
const { initDB } = require('../Config/database');
const Image = require('../Models/imageModel');

class ImageService {
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
     * Creates a new image entry in the database.
     * Converts image buffers to base64 format before storing them in the database.
     * @param {Object} param0 - The object containing image buffers.
     * @param {Buffer} param0.image_front - Buffer of the front image.
     * @param {Buffer} param0.image_side - Buffer of the side image.
     * @returns {Promise<Object>} - Returns the created image entry with its ID and base64-encoded data.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createImage({ image_front, image_side }) {
        try {
            // Convert image buffers to base64 strings
            const imageFrontBase64 = image_front.toString('base64');
            const imageSideBase64 = image_side.toString('base64');

            // Insert the base64-encoded images into the database
            const [result] = await this.pool.query(
                'INSERT INTO image (image_front, image_side) VALUES (?, ?)',
                [imageFrontBase64, imageSideBase64]
            );

            // Check if an image ID was generated (indicating success)
            if (!result.insertId) {
                throw new Error('Failed to create image entry'); // Throw an error if insert failed
            }

            console.log('Image entry created successfully with ID:', result.insertId); // Log the new image ID

            // Return the created image entry details
            return {
                id: result.insertId,
                image_front: imageFrontBase64,
                image_side: imageSideBase64,
            };

        } catch (e) {
            console.error('Error during image insertion:', e.message); // Log any error that occurs
            throw new Error(`Error creating image: ${e.message}`); // Rethrow a new error with a detailed message
        }
    }

    /**
     * Deletes an existing image entry by its ID.
     * @param {number} id - The ID of the image to be deleted.
     * @returns {Promise<boolean>} - Returns true if the deletion was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async deleteImage(id) {
        try {
            // Execute the delete query for the image by ID
            const [result] = await this.pool.query('DELETE FROM image WHERE image_Id = ?', [id]);
            return result.affectedRows > 0; // Return true if an image was deleted, otherwise false
        } catch (e) {
            throw new Error(`Error deleting image: ${e.message}`); // Rethrow an error if the deletion fails
        }
    }
}

module.exports = new ImageService(); // Export an instance of the ImageService
