// Importing moment for potential date manipulation
const moment = require("moment");

// Author class representing the author entity
class Author {
    /**
     * Constructor to initialize an Author object.
     * @param {number} author_Id - Unique ID of the author
     * @param {string} first_name - First name of the author
     * @param {string} last_name - Last name of the author
     */
    constructor(author_Id, first_name, last_name) {
        this.author_Id = author_Id;
        this.first_name = first_name;
        this.last_name = last_name;
    }

    /**
     * Static method to create an Author instance from a database row.
     * @param {object} row - The database row containing author data
     * @returns {Author} - New Author instance
     */
    static fromRow(row) {
        return new Author(
            row.author_Id,
            row.first_name,
            row.last_name
        );
    }
}

// Exporting the Author class to use in other modules
module.exports = Author;
