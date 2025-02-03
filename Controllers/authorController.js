// Importing the author service to handle author-related operations
const authorService = require('../Services/authorServices');

class AuthorController {

    /**
     * Get all authors from the database.
     * @param {object} req - The request object.
     * @param {object} res - The response object.
     */
    async getAllAuthors(req, res) {
        try {
            const authors = await authorService.getAllAuthors(); // Fetch all authors from the service
            res.json(authors); // Return the list of authors as a JSON response
        } catch (e) {
            console.error('Error fetching authors:', e); // Log any error that occurs
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code in case of an error
        }
    }

    /**
     * Get a specific author by their ID.
     * @param {object} req - The request object (contains the author ID in the URL).
     * @param {object} res - The response object (used to send back the result).
     */
    async getAuthorById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Get the author ID from the request parameters and convert to an integer
            const author = await authorService.getAuthorById(id); // Call the service to fetch the author by ID

            if (!author) {
                return res.status(404).json({ message: 'Author not found' }); // Return 404 if the author is not found
            }
            res.json(author); // Return the found author as JSON
        } catch (e) {
            console.error('Error fetching author by ID:', e); // Log any error that occurs
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code in case of an error
        }
    }

    /**
     * Get authors by their name.
     * @param {object} req - The request object (contains the author's name in the URL).
     * @param {object} res - The response object (used to send back the result).
     */
    async getAuthorByName(req, res) {
        try {
            const name = req.params.name; // Capture the single name parameter from the request
            const authors = await authorService.getAuthorByName(name); // Call the service to fetch authors by the given name

            if (authors.length === 0) {
                return res.status(404).json({ message: 'No authors found' }); // Return 404 if no authors are found
            }

            res.json(authors); // Return the list of found authors as JSON
        } catch (e) {
            console.error('Error fetching authors by name:', e); // Log any error that occurs
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code in case of an error
        }
    }

    /**
     * Create a new author and save them to the database.
     * @param {object} req - The request object (contains the author data).
     * @param {object} res - The response object (used to send back the result).
     */
    async createAuthor(req, res) {
        try {
            const { first_name, last_name } = req.body; // Destructure the first and last name from the request body

            // Check if both first and last name are provided, if not return a 400 error
            if (!first_name || !last_name) {
                return res.status(400).json({ message: 'Missing information' });
            }

            // Call the service to create the new author
            const newAuthor = await authorService.createAuthor({ first_name, last_name });
            res.status(201).json(newAuthor); // Return the newly created author as JSON with a 201 status code
        } catch (e) {
            console.error('Error creating author:', e); // Log any error that occurs during author creation
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code in case of an error
        }
    }

    /**
     * Update an existing author by their ID.
     * @param {object} req - The request object (contains the author ID and updated data).
     * @param {object} res - The response object (used to send back the result).
     */
    async updateAuthor(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Get the author ID from the request parameters
            const { first_name, last_name } = req.body; // Destructure the updated first and last name from the request body

            // Check if both first and last name are provided, if not return a 400 error
            if (!first_name || !last_name) {
                return res.status(400).json({ message: 'Missing author information' });
            }

            // Call the service to update the author
            const success = await authorService.updateAuthor(id, { first_name, last_name });

            if (!success) {
                return res.status(404).json({ message: 'Author not found or no changes made' }); // Return 404 if the author was not found or no changes were made
            }

            res.json({ message: 'Author updated successfully' }); // Return a success message
        } catch (e) {
            console.error('Error updating author:', e); // Log any error that occurs during author update
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code in case of an error
        }
    }

    /**
     * Delete an author by their ID.
     * @param {object} req - The request object (contains the author ID in the URL).
     * @param {object} res - The response object (used to send back the result).
     */
    async deleteAuthor(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Get the author ID from the request parameters

            // Call the service to delete the author
            const success = await authorService.deleteAuthor(id);

            if (!success) {
                return res.status(404).json({ message: 'Author not found' }); // Return 404 if the author is not found
            }

            res.json({ message: 'Author deleted successfully' }); // Return a success message
        } catch (e) {
            console.error('Error deleting author:', e); // Log any error that occurs during deletion
            res.status(500).json({ message: 'Internal server error' }); // Return a 500 status code in case of an error
        }
    }
}

module.exports = new AuthorController(); // Export the AuthorController instance
