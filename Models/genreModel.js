// Importing moment for potential future date manipulation, if needed
const moment = require("moment");

// Genre class representing a genre or category for books in the library system
class Genre {
    /**
     * Constructor to initialize a Genre object.
     * @param {number} genre_Id - Unique ID of the genre
     * @param {string} genre_name - Name of the genre (e.g., Fiction, Science, Fantasy)
     */
    constructor(genre_Id, genre_name) {
        this.genre_Id = genre_Id;
        this.genre_name = genre_name;
    }

    /**
     * Static method to create a Genre instance from a database row.
     * @param {object} row - The database row containing Genre data
     * @returns {Genre} - New Genre instance
     */
    static fromRow(row) {
        return new Genre(
            row.genre_Id,       // Unique ID for the genre from the database
            row.genre_name      // Name of the genre
        );
    }
}

// Exporting the Genre class for use in other modules
module.exports = Genre;
