// Importing the book service to handle the business logic for books
const bookService = require('../Services/bookServices');

class BookController {

    /**
     * Fetch all books and return them as a JSON response.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllBooks(req, res) {
        try {
            const books = await bookService.getAllBooks(); // Fetch all books from the service
            res.json(books); // Return the list of books as a JSON response
        } catch (e) {
            console.error('Error fetching books:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch a specific book by its ID.
     * @param {Object} req - The request object, containing the book ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the book ID from the request parameters
            const book = await bookService.getBookById(id); // Fetch the book by ID from the service
            if (!book) {
                return res.status(404).json({ message: 'Book not found' }); // Return 404 if book is not found
            }
            res.json(book); // Return the found book as JSON
        } catch (e) {
            console.error('Error fetching book:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch a book by its title.
     * @param {Object} req - The request object, containing the book title in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getBookByTitle(req, res) {
        try {
            const title = req.params.title; // Capture the title parameter from the request
            const book = await bookService.getBookByTitle(title); // Fetch the book by title from the service
            if (!book) {
                return res.status(404).json({ message: 'Book not found' }); // Return 404 if book is not found
            }
            res.json(book); // Return the found book as JSON
        } catch (e) {
            console.error('Error fetching book:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new book in the database.
     * Validates required fields before creation.
     * @param {Object} req - The request object, containing book data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createBook(req, res) {
        try {
            const { first_name, last_name, title, ISBN, date, language, count, genres, description } = req.body;

            // Validate required fields
            if (!first_name || !last_name || !title || !ISBN || !date || !language || !count || !genres || !description) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Call createBook in bookService to handle book creation
            const newBook = await bookService.createBook({
                first_name, last_name, title,
                ISBN, date, language, count, genres, description
            });

            // Respond with the created book and a 201 status
            res.status(201).json(newBook);

        } catch (e) {
            console.error('Error creating book:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing book by its ID.
     * Validates required fields before updating.
     * @param {Object} req - The request object, containing the book ID in the URL and updated data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateBook(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the book ID from the request parameters
            const { first_name, last_name, title, ISBN, date, language, count, genres, description } = req.body;

            // Validate required fields
            if (!first_name || !last_name || !title || !ISBN || !date || !language || !count || !genres || !description) {
                return res.status(400).json({ message: 'Missing fields' });
            }

            // Call updateBook in bookService to handle book update
            const success = await bookService.updateBook(id, { first_name, last_name, title, ISBN, date, language, count, genres, description });
            if (!success) {
                return res.status(404).json({ message: 'Book not found or no changes made' }); // Return 404 if no update occurs
            }
            res.json({ message: 'Book updated successfully' }); // Confirm successful update
        } catch (e) {
            console.error('Error updating book:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a book by its ID.
     * @param {Object} req - The request object, containing the book ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteBook(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the book ID from the request parameters
            const success = await bookService.deleteBook(id); // Call deleteBook in bookService
            if (!success) {
                return res.status(404).json({ message: 'Book not found' }); // Return 404 if book is not found
            }
            res.json({ message: 'Book deleted successfully' }); // Confirm successful deletion
        } catch (e) {
            console.error('Error deleting book:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Search for books based on a keyword.
     * Searches multiple fields including title, author, and genre.
     * @param {Object} req - The request object, containing the search keyword in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async searchBook(req, res) {
        try {
            const keyword = req.params.keyword; // Capture the search keyword from the request
            const books = await bookService.searchBook(keyword); // Call searchBook in bookService
            if (!books.length) {
                return res.status(404).json({ message: 'Books not found' }); // Return 404 if no books match the search
            }
            res.json(books); // Return the found books as JSON
        } catch (e) {
            console.error('Error searching books:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }
}

module.exports = new BookController(); // Export an instance of the BookController
