// Importing moment for date formatting and manipulation if required
const moment = require("moment");

// Review class representing a review for a book in the system
class Review {
    /**
     * Constructor to initialize a Review object.
     * @param {number} review_Id - Unique ID of the review
     * @param {string} review_date - Date when the review was created
     * @param {string} review_des - Text content of the review
     * @param {number} book_Id - ID of the book being reviewed
     * @param {number} rating - Rating associated with the review (e.g., out of 5)
     */
    constructor(review_Id, review_date, review_des, book_Id, rating) {
        this.review_Id = review_Id;
        this.review_date = review_date;
        this.review_des = review_des;
        this.book_Id = book_Id;
        this.rating = rating;
    }

    /**
     * Static method to create a Review instance from a database row.
     * Formats the review date for consistent representation.
     * @param {object} row - The database row containing Review data
     * @returns {Review} - New Review instance
     */
    static fromRow(row) {
        return new Review(
            row.review_Id,                                   // Unique ID of the review from the database
            moment(row.date).format("YY-MMM-DD hh:mm:ss"),   // Formatted date of the review
            row.review_des,                                  // Text content of the review
            row.book_Id,                                     // ID of the associated book
            row.rating                                       // Rating for the review
        );
    }
}

// Exporting the Review class for use in other modules
module.exports = Review;
