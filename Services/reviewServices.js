// Importing the database initialization function, review model, and book service
const { initDB } = require('../Config/database');
const Review = require('../Models/reviewModel');
const bookService = require('./bookServices');

class reviewService {
    constructor() {
        this.pool = null; // Initialize the database connection pool as null
        this.init(); // Initialize the database connection pool
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
     * Fetches all reviews from the database, including the book title.
     * Joins the review and book tables based on book ID.
     * @returns {Promise<Review[]>} - Returns an array of Review instances.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllReviews() {
        try {
            const [rows] = await this.pool.query(`SELECT title, review.* 
                FROM review JOIN book ON review.book_Id = book.book_Id`);
            return rows.map(Review.fromRow); // Map each row to a Review instance
        } catch (e) {
            throw new Error(`Error fetching reviews: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches a review by its ID, including the book title.
     * Joins the review and book tables based on book ID.
     * @param {number} id - The ID of the review.
     * @returns {Promise<Review|null>} - Returns a Review instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getReviewById(id) {
        try {
            const [rows] = await this.pool.query(`SELECT title, review.* 
                FROM review 
                JOIN book ON review.book_Id = book.book_Id
                 WHERE review_Id = ?`, [id]);
            if (rows.length === 0) return null; // Return null if review is not found
            return Review.fromRow(rows[0]); // Convert the row to a Review instance
        } catch (e) {
            throw new Error(`Error fetching review by ID: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches reviews by the book title.
     * Joins the review and book tables based on book ID.
     * @param {string} title - The title of the book.
     * @returns {Promise<Review|null>} - Returns a Review instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getReviewByTitle(title) {
        try {
            const [rows] = await this.pool.query(`SELECT title, review.* 
                FROM review 
                JOIN book 
                ON review.book_Id = book.book_Id WHERE title = ?`, [title]);
            if (rows.length === 0) return null; // Return null if no reviews are found for the title
            return Review.fromRow(rows[0]); // Convert the row to a Review instance
        } catch (e) {
            throw new Error(`Error fetching reviews by title: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches reviews by rating.
     * Joins the review and book tables based on book ID.
     * @param {number} rate - The rating of the review.
     * @returns {Promise<Review|null>} - Returns a Review instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getReviewByRate(rate) {
        try {
            const [rows] = await this.pool.query(`SELECT title, review.* 
                FROM review JOIN book ON review.book_Id = book.book_Id WHERE rating = ?`, [rate]);
            if (rows.length === 0) return null; // Return null if no reviews are found for the rating
            return Review.fromRow(rows[0]); // Convert the row to a Review instance
        } catch (e) {
            throw new Error(`Error fetching reviews by rating: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Creates a new review for a specified book.
     * Fetches the book ID by its title before creating the review.
     * @param {Object} reviewData - The review data, including book title, rating, date, and description.
     * @returns {Promise<Review>} - Returns the newly created Review instance.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createReview(reviewData) {
        try {
            const { title, rating, review_des } = reviewData; // Destructure the review data


            // Fetch the book by title to get the book ID
            const book = await bookService.getBookByTitle(title);
            if (!book) {
                return 'Failed to find book'; // Return message if the book is not found
            }

            const bookId = book.id;
            const currentDateISO = new Date().toISOString();

            // Insert review into the database
            const [result] = await this.pool.query(
                `INSERT INTO review (book_Id, rating, review_date, review_des) VALUES (?, ?, ?, ?)`,
                [bookId, rating, currentDateISO, review_des]
            );

            if (!result.insertId) {
                throw new Error('Failed to create review'); // Throw error if review creation fails
            }

            // Retrieve and return the new review
            return await this.getReviewById(result.insertId);

        } catch (e) {
            throw new Error(`Error creating review: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Updates an existing review by its ID.
     * Fetches the book ID by its title before updating the review.
     * @param {number} id - The ID of the review to update.
     * @param {Object} reviewData - The updated review data, including book title, rating, date, and description.
     * @returns {Promise<Review>} - Returns the updated Review instance.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async updateReview(id, reviewData) {
        try {
            const { title, rating, review_des } = reviewData; // Destructure the review data

            // Fetch the book by title to get the book ID
            const book = await bookService.getBookByTitle(title);
            if (!book) {
                return 'Failed to find book'; // Return message if the book is not found
            }

            const bookId = book.book_Id;

            // Update the review in the database
            const [result] = await this.pool.query(
                `UPDATE review SET rating = ?, review_des = ? WHERE review_Id = ?`,
                [parseInt(rating), review_des, id]
            );

            if (result.affectedRows === 0) {
                return `Review with ID ${id} not found or no changes made`; // Return message if update fails
            }

            // Retrieve and return the updated review
            return await this.getReviewById(id);

        } catch (e) {
            throw new Error(`Error updating review: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Deletes a review by its ID.
     * @param {number} id - The ID of the review to delete.
     * @returns {Promise<boolean>} - Returns true if the deletion was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async deleteReview(id) {
        try {
            const [result] = await this.pool.query(`DELETE FROM review WHERE review_Id = ?`, [id]); // Delete the review by ID
            return result.affectedRows > 0; // Return true if the deletion was successful
        } catch (e) {
            throw new Error(`Error deleting review: ${e.message}`); // Rethrow error with additional context
        }
    }
}

module.exports = new reviewService(); // Export an instance of the reviewService
