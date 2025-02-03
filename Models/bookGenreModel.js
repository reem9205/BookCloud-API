// Importing moment for potential date manipulation (currently unused in this file)
const moment = require("moment");

// BookGenre class representing the relationship between a book and a genre
class BookGenre {
    /**
     * Constructor to initialize a BookGenre object.
     * @param {number} genre_Id - ID of the genre
     * @param {number} book_Id - ID of the book
     */
    constructor(genre_Id, book_Id) {
        this.book_Id = book_Id;
        this.genre_Id = genre_Id;
    }

    /**
     * Static method to create a BookGenre instance from a database row.
     * @param {object} row - The database row containing BookGenre data
     * @returns {BookGenre} - New BookGenre instance
     */
    static fromRow(row) {
        return new BookGenre(
            row.genre_Id,
            row.book_Id
        );
    }
}

// Exporting the BookGenre class to use in other modules
module.exports = BookGenre;
