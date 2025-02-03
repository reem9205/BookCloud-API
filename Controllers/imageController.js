// Importing the image service to handle image-related operations
const imageService = require('../Services/imageServices.js');

class ImageController {


    async getAllImages(req, res) {
        try {
            const images = await imageService.getAllImages(); // Fetch all genres from the service
            res.json(images); // Return the list of genres as a JSON response
        } catch (e) {
            console.error('Error fetching genres:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Creates a new image entry.
     * This method expects `image_front` and `image_side` to be uploaded through `req.files`.
     * @param {Object} req - The request object, containing the uploaded image files.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createImage(req, res) {
        try {
            // Retrieve image buffers from the uploaded files
            const { image_front } = req.body;


            // Validate that both `image_front` and `image_side` are provided
            if (!image_front) {
                return res.status(400).json({ message: 'Missing information: images are required' });
            }

            // Call the imageService to handle the image creation in the database
            const newImage = await imageService.createImage(image);

            // Respond with the created image details
            res.status(201).json(newImage);
            // res.render('')

        } catch (e) {
            console.error('Error creating image:', e); // Log any error that occurs
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code for server errors
        }
    }

    /**
     * Deletes an existing image entry by its ID.
     * This method expects an `id` parameter in the URL to identify the image to delete.
     * @param {Object} req - The request object, containing the image ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteImage(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the image ID from the request parameters

            // Call the imageService to delete the image by its ID
            const success = await imageService.deleteImage(id);

            if (!success) {
                return res.status(404).json({ message: 'Image not found' }); // Return 404 if the image is not found
            }

            res.json({ message: 'Image deleted successfully' }); // Confirm successful deletion
        } catch (e) {
            console.error('Error deleting image:', e); // Log any error that occurs
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code for server errors
        }
    }
}

module.exports = new ImageController(); // Export an instance of the ImageController
