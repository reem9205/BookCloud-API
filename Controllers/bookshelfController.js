// Importing the bookshelf service to handle business logic for bookshelf-related operations
const bookshelfServices = require('../Services/bookshelfServices');
const bookByUserService = require('../Services/bookByUserServices');
const userService = require('../Services/userServices');

/**
 * BookshelfController handles requests related to bookshelves.
 * It provides methods to create, read, update, and delete bookshelf entries.
 *
 * @class BookshelfController
 */
class BookshelfController {
    /**
     * Fetch all bookshelves.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllBookshelf(req, res) {
        try {
            const bookshelf = await bookshelfServices.getAllBookshelf(); // Fetch all bookshelves from the service
            res.json(bookshelf); // Return the fetched bookshelves
        } catch (e) {
            console.error(`Error fetching bookshelves:`, e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch a specific bookshelf by its ID.
     * @param {Object} req - The request object, which contains the bookshelf ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookshelfById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the bookshelf ID from the request parameters
            const bookshelf = await bookshelfServices.getBookshelfById(id); // Fetch the bookshelf by ID
            if (!bookshelf) {
                return res.status(404).json({ message: 'bookshelf not found' }); // Return 404 if not found
            }
            res.json(bookshelf); // Return the fetched bookshelf
        } catch (e) {
            console.error('Error fetching bookshelf:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch bookshelves associated with a specific user by username.
     * @param {Object} req - The request object, which contains the username in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookshelfByUsername(req, res) {
        try {
            const username = req.params.username; // Extract the username from the request parameters
            const bookshelf = await bookshelfServices.getBookshelfByUsername(username); // Fetch bookshelves by username
            if (!bookshelf) {
                return res.status(404).json({ message: 'bookshelf not found' }); // Return 404 if not found
            }
            res.json(bookshelf); // Return the fetched bookshelf data
        } catch (e) {
            console.error('Error fetching bookshelf:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch bookshelves by their name.
     * @param {Object} req - The request object, which contains the bookshelf name in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookshelfByName(req, res) {
        try {
            const name = req.params.name; // Extract the bookshelf name from the request parameters
            const bookshelf = await bookshelfServices.getBookshelfByName(name); // Fetch bookshelves by name
            if (!bookshelf) {
                return res.status(404).json({ message: 'bookshelf not found' }); // Return 404 if not found
            }
            res.json(bookshelf); // Return the fetched bookshelf data
        } catch (e) {
            console.error('Error fetching bookshelf:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch bookshelves by their view type (public or private).
     * @param {Object} req - The request object, which contains the view type in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookshelfByView(req, res) {
        try {
            const view = req.params.view; // Extract the view type from the request parameters
            if (view !== "public" && view !== "private") {
                return res.status(400).json({ message: 'Invalid view. Must be either "public" or "private"' }); // Validate view type
            }
            const bookshelf = await bookshelfServices.getBookshelfByView(view); // Fetch bookshelves by view type
            if (!bookshelf) {
                return res.status(404).json({ message: 'bookshelf not found' }); // Return 404 if not found
            }
            res.json(bookshelf); // Return the fetched bookshelf data
        } catch (e) {
            console.error('Error fetching bookshelf:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new bookshelf.
     * @param {Object} req - The request object, containing bookshelf data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createBookshelf(req, res) {
        try {
            const { username, view, bookshelf_name } = req.body; // Extract data from the request body

            // Validate required fields and view type
            if (!username || !view || !bookshelf_name) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            if (view !== "public" && view !== "private") {
                return res.status(400).json({ message: 'Invalid view. Must be either "public" or "private"' });
            }

            const newBookshelf = await bookshelfServices.createBookshelf({ username, view, bookshelf_name }); // Create new bookshelf

            return res.redirect(`/api/bookshelf/editBookshelfView/${newBookshelf.id}`);

        } catch (e) {
            console.error('Error creating bookshelf:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing bookshelf.
     * @param {Object} req - The request object, which contains the bookshelf ID in the URL and new data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateBookshelf(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the bookshelf ID from the request parameters
            const { view, bookshelf_name } = req.body; // Extract data from the request body

            // Validate required fields and view type
            if (!view || !bookshelf_name) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            if (view !== "public" && view !== "private") {
                return res.status(400).json({ message: 'Invalid view. Must be either "public" or "private"' });
            }

            const success = await bookshelfServices.updateBookshelf(id, { view, bookshelf_name }); // Update the bookshelf
            if (!success) {
                return res.status(404).json({ message: 'bookshelf not found or no changes made' }); // Return 404 if no update occurs
            }
            res.redirect(`/api/bookshelf/editBookshelfView/${id}`);
        } catch (e) {
            console.error('Error updating bookshelf:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a specific bookshelf by its ID.
     * @param {Object} req - The request object, which contains the bookshelf ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteBookshelf(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the bookshelf ID from the request parameters
            const success = await bookshelfServices.deleteBookshelf(id); // Attempt to delete the bookshelf
            if (!success) {
                return res.status(404).json({ message: 'bookshelf not found' }); // Return 404 if not found
            }
            res.redirect(`/api/users/dashboard`);
        } catch (e) {
            console.error('Error deleting bookshelf:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
    * takes to edit view
    * @param {Object} req - The request object, which contains the bookshelf ID in the URL.
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async bookshelfEdit(req, res) {
        try {
            const user_Id = req.session.user?.user_Id;

            // Ensure user is authenticated
            if (!user_Id) {
                return res.redirect('/Homepage');
            }

            // Retrieve bookshelf_Id from req.params 
            const bookshelf_Id = req.params.bookshelf_Id || req.body.bookshelf_Id || req.query.bookshelf_Id;
            if (!bookshelf_Id) {

                return res.status(400).render('errorPage', { error: 'Invalid bookshelf ID' });
            }


            // Fetch bookshelf and books associated with it
            const bookshelf = await bookshelfServices.getBookshelfById(bookshelf_Id);
            if (!bookshelf) {
                console.error("Bookshelf not found for ID:", bookshelf_Id);
                return res.status(404).render('errorPage', { error: 'Bookshelf not found' });
            }

            // Fetch books for the user
            const books = await bookByUserService.getbookByUserById(user_Id);

            // Fetch user data
            const data = await userService.getBasicInfoForallViews(user_Id);


            // Render the editBookshelf view with data
            res.render('editBookshelf', { user: req.session.user, bookshelf, books, data, id: bookshelf_Id });
        } catch (error) {
            console.error('Error fetching bookshelf or books:', error);
            res.status(500).render('errorPage', { error: 'Error loading bookshelf data' });
        }
    }

}

// Exporting the controller instance for use in route handling
module.exports = new BookshelfController();
