// Importing the genre service to handle business logic for genres
const genreService = require('../Services/genreServices');

class GenreController {

    /**
     * Fetch all genres from the database.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllGenres(req, res) {
        try {
            const genres = await genreService.getAllGenres(); // Fetch all genres from the service
            res.json(genres); // Return the list of genres as a JSON response
        } catch (e) {
            console.error('Error fetching genres:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch a specific genre by its ID.
     * @param {Object} req - The request object, containing the genre ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getGenreById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the genre ID from the request parameters
            const genre = await genreService.getGenreById(id); // Fetch the genre by ID from the service

            if (!genre) {
                return res.status(404).json({ message: 'Genre not found' }); // Return a 404 if the genre is not found
            }
            res.json(genre); // Return the found genre as JSON
        } catch (e) {
            console.error('Error fetching genre by ID:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch genres by a specific type (genre name).
     * @param {Object} req - The request object, containing the genre name in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getGenreByType(req, res) {
        try {
            const type = req.params.name; // Capture the genre name parameter from the request
            const genres = await genreService.getGenreByType(type); // Fetch genres by name from the service

            if (genres.length === 0) {
                return res.status(404).json({ message: 'No genres found' }); // Return a 404 if no genres are found
            }
            res.json(genres); // Return the list of found genres as JSON
        } catch (e) {
            console.error('Error fetching genres by type:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new genre in the database.
     * @param {Object} req - The request object, containing genre data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createGenre(req, res) {
        try {
            const { genre_name } = req.body; // Extract genre name from the request body

            if (!genre_name) {
                return res.status(400).json({ message: 'Missing information' }); // Return an error if genre_name is missing
            }

            const newGenre = await genreService.createGenre({ genre_name }); // Call the service to create the new genre
            res.status(201).json(newGenre); // Return the newly created genre with a 201 status code
        } catch (e) {
            console.error('Error creating genre:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing genre in the database by its ID.
     * @param {Object} req - The request object, containing the genre ID in the URL and updated data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateGenre(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the genre ID from the request parameters
            const { genre_name } = req.body; // Extract updated genre name from the request body

            if (!genre_name) {
                return res.status(400).json({ message: 'Missing genre information' }); // Return an error if genre_name is missing
            }

            const success = await genreService.updateGenre(id, { genre_name }); // Call the service to update the genre
            if (!success) {
                // Return a 404 if no update occurs
                return res.status(404).json({ message: 'Genre not found or no changes made' });
            }
            res.json({ message: 'Genre updated successfully' }); // Confirm successful update
        } catch (e) {
            console.error('Error updating genre:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a genre by its ID.
     * Checks for related records before attempting deletion.
     * @param {Object} req - The request object, containing the genre ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteGenre(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the genre ID from the request parameters

            const success = await genreService.deleteGenre(id); // Call the service to delete the genre
            if (success === 'Cannot delete genre; related records exist.') {
                return res.status(400).json({ message: success }); // Return a 400 error if related records exist
            } else if (!success) {
                return res.status(404).json({ message: 'Genre not found' }); // Return a 404 if the genre is not found
            }
            res.json({ message: 'Genre deleted successfully' }); // Confirm successful deletion
        } catch (e) {
            console.error('Error deleting genre:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }
}

module.exports = new GenreController(); // Export an instance of the GenreController
