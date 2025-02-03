// Importing moment for potential date manipulation, which helps format date strings
const moment = require("moment");

// BookByUser class representing the relationship between a user and a book they are interacting with
class BookByUser {
    /**
     * Constructor to initialize a BookByUser object.
     * @param {number} id - Unique ID of the BookByUser entry
     * @param {number} user_Id - ID of the user
     * @param {number} book_Id - ID of the book
     * @param {number} current - Current page the user is on
     * @param {string} start - Start date of the reading activity
     * @param {string} end - End date of the reading activity
     * @param {string} status - Reading status (e.g., "read", "unread", "reading")
     */
    constructor(id, user_Id, book_Id, current, start, end, status) {
        this.id = id;
        this.user_Id = user_Id;
        this.book_Id = book_Id;
        this.current = current;
        this.start = start;
        this.end = end;
        this.status = status;
    }

    /**
     * Static method to create a BookByUser instance from a database row.
     * Formats the start and end dates to a specific date-time format.
     * @param {object} row - The database row containing BookByUser data
     * @returns {BookByUser} - New BookByUser instance
     */
    static fromRow(row) {
        return new BookByUser(
            row.Book_user_Id,            // ID of the BookByUser entry from the database
            row.book_Id,                 // ID of the book being referenced
            row.user_Id,                 // ID of the user interacting with the book
            row.current_page,            // The current page number the user is on
            moment(row.start).format("YYYY-MM-DD HH:mm:ss"),  // Formatted start date
            moment(row.end).format("YY-MMM-DD hh:mm:ss"),    // Formatted end date
            row.status                    // Reading status (e.g., "read", "unread", "reading")
        );
    }
}

// Exporting the BookByUser class to make it available for other modules
module.exports = BookByUser;
