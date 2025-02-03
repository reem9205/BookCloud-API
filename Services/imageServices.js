// Importing database initialization function and the Image model
const { initDB } = require('../Config/database');
const Image = require('../Models/imageModel');

class ImageService {
    constructor() {
        this.pool = null;
        this.init();
    }

    async init() {
        this.pool = await initDB();
    }

    async getAllImages() {
        try {
            // Fetch rows from the database
            const [rows] = await this.pool.query('SELECT * FROM image'); // Adjust query if needed


            // Convert each blob to Base64
            const images = rows.map((row) => {
                const base64Image = Buffer.from(row.image_front).toString('base64'); // Convert blob to Base64
                return {
                    id: row.image_Id, // Include the ID for tracking
                    image: `data:image/jpeg;base64,${base64Image}` // Add MIME type
                };
            });



            return images; // Return the array of images
        } catch (e) {
            throw new Error(`Error fetching images: ${e.message}`);
        }
    }



    async createImage(base64Image) {
        try {


            // Extract the Base64 part (removing the prefix like "data:image/jpeg;base64,")
            const base64Data = base64Image.split(',')[1];

            if (!base64Data) {
                throw new Error('Invalid Base64 image format');
            }

            // Convert Base64 to binary data (Buffer)
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // Insert binary data into the database
            const [result] = await this.pool.query(
                `INSERT INTO image (image_front) VALUES (?)`,
                [imageBuffer]
            );

            if (!result.insertId) {
                throw new Error('Failed to create image entry');
            }

            return { id: result.insertId, image_front: base64Image }; // You can also return the buffer if needed
        } catch (e) {
            throw new Error(`Error creating image: ${e.message}`);
        }
    }



    async getImage(id) {
        try {
            const [rows] = await this.pool.query(
                'SELECT image_front, image_side FROM image WHERE image_Id = ?',
                [id]
            );

            if (rows.length === 0) {
                throw new Error('Image not found');
            }

            return rows[0];
        } catch (e) {
            console.error('Error fetching image:', e.message);
            throw new Error(`Error retrieving image: ${e.message}`);
        }
    }

    async deleteImage(id) {
        try {
            const [result] = await this.pool.query('DELETE FROM image WHERE image_Id = ?', [id]);
            return result.affectedRows > 0;
        } catch (e) {
            throw new Error(`Error deleting image: ${e.message}`);
        }
    }
}


module.exports = new ImageService(); // Export an instance of the ImageService
