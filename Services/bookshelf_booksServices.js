// Importing the database initialization function and the BookshelfBooks model
const { initDB } = require('../Config/database');
const BookshelfBooks = require('../Models/bookshelf_booksModel');

/**
 * BookshelfBooksService handles operations related to managing associations between books and bookshelves.
 * It provides methods to create, retrieve, update, and delete book-to-bookshelf associations.
 * 
 * @class BookshelfBooksService
 */
class BookshelfBooksService {
    constructor() {
        this.pool = null; // Initialize the database connection pool
        this.init(); // Call the init method to set up the connection pool
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
     * Get all entries in the bookshelf_books table, i.e., all associations between books and bookshelves.
     * @returns {Promise<BookshelfBooks[]>} - Returns an array of BookshelfBooks objects.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllBookshelfBooks() {
        try {
            const [rows] = await this.pool.query('SELECT * FROM bookshelf_books'); // Query to fetch all associations
            return rows.map(BookshelfBooks.fromRow); // Map the rows to BookshelfBooks objects
        } catch (e) {
            throw new Error(`Error fetching bookshelf associations: ${e.message}`); // Error handling
        }
    }

    /**
     * Get all books associated with a specific bookshelf by its ID.
     * @param {number} bookshelfId - The ID of the bookshelf.
     * @returns {Promise<BookshelfBooks[] | null>} - Returns an array of BookshelfBooks objects or null if no associations found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getBookshelfBooksById(id) {
        try {
            const [rows] = await this.pool.query(
                `SELECT * FROM bookshelf_books WHERE bookshelf_id = ?`, [id] // Query to fetch books for a specific bookshelf
            );
            if (rows.length === 0) return null; // Return null if no books are associated with the bookshelf
            return rows.map(BookshelfBooks.fromRow); // Map the rows to BookshelfBooks objects
        } catch (e) {
            throw new Error(`Error fetching books by bookshelf ID: ${e.message}`); // Error handling
        }
    }

    /**
     * Create a new association between a book and a bookshelf in the database.
     * @param {object} param0 - Object containing book_id and bookshelf_id.
     * @param {number} param0.book_id - The ID of the book.
     * @param {number} param0.bookshelf_id - The ID of the bookshelf.
     * @returns {Promise<{book_id: number, bookshelf_id: number} | string>} - Returns the created association or an error message if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createBookshelfBooks({ book_id, bookshelf_id }) {
        try {
            // Check if the book exists
            const [bookRows] = await this.pool.query(
                `SELECT book_id FROM book WHERE book_id = ?`, [book_id]
            );
            if (bookRows.length === 0) {
                console.error(`Book with ID ${book_id} not found.`);
                return 'Book not found'; // Return error message if the book is not found
            }

            // Check if the bookshelf exists
            const [shelfRows] = await this.pool.query(
                `SELECT bookshelf_id FROM bookshelf WHERE bookshelf_id = ?`, [bookshelf_id]
            );
            if (shelfRows.length === 0) {
                console.error(`Bookshelf with ID ${bookshelf_id} not found.`);
                return 'Bookshelf not found'; // Return error message if the bookshelf is not found
            }

            // Insert the association in the bookshelf_books table
            const [insertResult] = await this.pool.query(
                `INSERT INTO bookshelf_books (book_id, bookshelf_id) VALUES (?, ?)`,
                [book_id, bookshelf_id]
            );

            console.log(`Association created: Book ID ${book_id} with Bookshelf ID ${bookshelf_id}`);
            return { book_id, bookshelf_id }; // Return the created association
        } catch (e) {
            console.error(`Error in createBookshelfBooks: ${e.message}`);
            throw new Error(`Error creating book-shelf association: ${e.message}`); // Error handling
        }
    }

    /**
     * Delete a book-shelf association by book_id and bookshelf_id.
     * @param {number} book_id - The ID of the book.
     * @param {number} bookshelf_id - The ID of the bookshelf.
     * @returns {Promise<boolean>} - Returns true if the deletion was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async deleteBookshelfBook(book_id, bookshelf_id) {
        try {
            const [result] = await this.pool.query(
                `DELETE FROM bookshelf_books WHERE book_id = ? AND bookshelf_id = ?`,
                [book_id, bookshelf_id]
            );
            return result.affectedRows > 0; // Return whether the deletion was successful
        } catch (e) {
            throw new Error(`Error deleting book-shelf association: ${e.message}`); // Error handling
        }
    }

    /**
     * Update a book-shelf association in the database.
     * @param {number} bookId - The original book ID.
     * @param {number} bookshelfId - The original bookshelf ID.
     * @param {number} newBookId - The new book ID.
     * @param {number} newBookshelfId - The new bookshelf ID.
     * @returns {Promise<boolean>} - Returns true if the update was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async updateBookshelfBooks(bookId, bookshelfId, newBookId, newBookshelfId) {
        try {
            const [result] = await this.pool.query(
                `UPDATE bookshelf_books SET book_id = ?, bookshelf_id = ? 
                 WHERE book_id = ? AND bookshelf_id = ?`,
                [newBookId, newBookshelfId, bookId, bookshelfId]
            );
            return result.affectedRows > 0; // Return whether the update was successful
        } catch (e) {
            throw new Error(`Error updating book-shelf association: ${e.message}`); // Error handling
        }
    }
}

module.exports = new BookshelfBooksService(); // Export a new instance of the service
