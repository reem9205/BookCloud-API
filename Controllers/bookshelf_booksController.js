// Importing the bookshelf books service to handle business logic for book-shelf associations
const bookshelfBooksServices = require('../Services/bookshelf_booksServices');

class BookshelfBooksController {

    /**
     * Fetch all bookshelf-book associations.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllBookshelfBooks(req, res) {
        try {
            // Fetch all bookshelf-book associations from the service
            const books = await bookshelfBooksServices.getAllBookshelfBooks();
            res.json(books); // Return the fetched bookshelf-book data
        } catch (e) {
            console.error('Error fetching bookshelf-book associations:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch bookshelf-book associations by a specific book ID.
     * @param {Object} req - The request object, which contains the book ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookshelfBookById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the book ID from the request parameters
            // Fetch the associated bookshelf books from the service
            const book = await bookshelfBooksServices.getBookshelfBooksById(id);

            if (!book) {
                return res.status(404).json({ message: 'Bookshelf-book association not found' }); // Return a 404 if no associations are found
            }
            res.json(book); // Return the associated bookshelf-book data
        } catch (e) {
            console.error('Error fetching bookshelf-book association by ID:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new bookshelf-book association.
     * @param {Object} req - The request object, containing book and bookshelf IDs in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createBookshelfBooks(req, res) {
        try {
            const { book_id, bookshelf_id } = req.body; // Extract book and bookshelf IDs from the request body

            if (!book_id || !bookshelf_id) {
                return res.status(400).json({ message: 'Missing information' }); // Return an error if either ID is missing
            }

            // Call the service to create the bookshelf-book association
            const newAssociation = await bookshelfBooksServices.createBookshelfBooks({ book_id, bookshelf_id });
            res.redirect(`/api/bookshelf/editBookshelfView/${bookshelf_id}`);
        } catch (e) {
            console.error('Error creating bookshelf-book association:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing bookshelf-book association.
     * @param {Object} req - The request object, which contains the old association IDs in the URL and new IDs in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateBookshelfBooks(req, res) {
        try {
            const { book_id, bookshelf_id } = req.params; // Retrieve the old book and bookshelf IDs from the URL
            const { newBookId, newBookshelfId } = req.body; // Retrieve the new book and bookshelf IDs from the body

            if (!newBookId || !newBookshelfId) {
                return res.status(400).json({ message: 'Missing book or bookshelf ID' }); // Return an error if new IDs are missing
            }

            // Attempt to update the bookshelf-book association through the service
            const success = await bookshelfBooksServices.updateBookshelfBooks(book_id, bookshelf_id, newBookId, newBookshelfId);
            if (!success) {
                return res.status(404).json({ message: 'Bookshelf-book association not found or no changes made' }); // Return a 404 if no update occurs
            }

            res.json({ message: 'Bookshelf-book association updated successfully' }); // Confirm successful update
        } catch (e) {
            console.error('Error updating bookshelf-book association:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a specific bookshelf-book association.
     * @param {Object} req - The request object, which contains the book and bookshelf IDs in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteBookshelfBooks(req, res) {
        try {
            const { book_id, bookshelf_id } = req.params; // Extract the book and bookshelf IDs from the request parameters

            // Attempt to delete the bookshelf-book association through the service
            const success = await bookshelfBooksServices.deleteBookshelfBook(book_id, bookshelf_id);
            if (!success) {
                return res.status(404).json({ message: 'Bookshelf-book association not found' }); // Return 404 if association is not found
            }

            res.redirect(`/api/bookshelf/editBookshelfView/${bookshelf_id}`);

        } catch (e) {
            console.error('Error deleting bookshelf-book association:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }
}

module.exports = new BookshelfBooksController();
