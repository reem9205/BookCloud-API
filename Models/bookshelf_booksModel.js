// Importing moment for potential date manipulation (currently unused in this file)
const moment = require("moment");

// BookshelfBook class representing the relationship between a book and a bookshelf
class BookshelfBook {
    /**
     * Constructor to initialize a BookshelfBook object.
     * @param {number} bookshelf_id - ID of the bookshelf
     * @param {number} book_id - ID of the book
     */
    constructor(bookshelf_id, book_id) {
        this.bookshelf_id = bookshelf_id;
        this.book_id = book_id;
    }

    /**
     * Static method to create a BookshelfBook instance from a database row.
     * @param {object} row - The database row containing BookshelfBook data
     * @returns {BookshelfBook} - New BookshelfBook instance
     */
    static fromRow(row) {
        return new BookshelfBook(
            row.bookshelf_id,
            row.book_id
        );
    }
}

// Exporting the BookshelfBook class to use in other modules
module.exports = BookshelfBook;
