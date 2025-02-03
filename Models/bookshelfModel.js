// Importing moment for potential date formatting and manipulation
const moment = require("moment");

// Bookshelf class representing a user's bookshelf containing books
class Bookshelf {
    /**
     * Constructor to initialize a Bookshelf object.
     * @param {number} id - Unique ID of the bookshelf
     * @param {string} name - Name of the bookshelf
     * @param {string} date - Creation date of the bookshelf
     * @param {number} user_Id - ID of the user who owns the bookshelf
     * @param {string} view - View setting of the bookshelf (e.g., public or private)
     * @param {number} book_Id - ID of the book associated with this bookshelf
     */
    constructor(id, name, date, user_Id, view) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.user_Id = user_Id;
        this.view = view;

    }

    /**
     * Static method to create a Bookshelf instance from a database row.
     * Formats the creation date using moment for consistency.
     * @param {object} row - The database row containing Bookshelf data
     * @returns {Bookshelf} - New Bookshelf instance
     */
    static fromRow(row) {
        return new Bookshelf(
            row.bookshelf_Id,                           // Bookshelf ID from the database
            row.bookshelf_name,                         // Name of the bookshelf
            moment(row.creation_date).format("YY-MMM-DD hh:mm:ss"), // Formatted creation date
            row.user_Id,                                // ID of the user who owns the bookshelf
            row.view,                                   // View setting (public/private)                             
        );
    }
}

// Exporting the Bookshelf class to use in other modules
module.exports = Bookshelf;
