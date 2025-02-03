// Importing the database initialization function and Bookshelf model
const { initDB } = require('../Config/database');
const Bookshelf = require('../Models/bookshelfModel');

/**
 * bookshelfServices handles operations related to bookshelves in the database.
 * It provides methods to create, read, update, and delete bookshelf associations.
 *
 * @class bookshelfServices
 */
class bookshelfServices {
    constructor() {
        this.pool = null; // Initialize the database connection pool as null
        this.init(); // Initialize the database connection pool
    }

    /**
     * Initializes the database connection pool.
     * Called automatically when an instance of the service is created.
     * @returns {Promise<void>}
     */
    async init() {
        this.pool = await initDB(); // Initialize the database connection pool
    }

    /**
     * Fetches all bookshelf entries, including associated book and user data.
     * Joins the `bookshelf`, `book`, and `user` tables to get comprehensive data.
     * @returns {Promise<Bookshelf[]>} - Array of bookshelf entries.
     */
    async getAllBookshelf() {
        try {
            const [rows] = await this.pool.query(`SELECT bookshelf_Id, username, bookshelf_name, creation_date, bookshelf.view 
                FROM bookshelf
                JOIN user ON 
                user.user_Id = bookshelf.user_Id`);
            return rows.map(Bookshelf.fromRow); // Map rows to Bookshelf model
        } catch (e) {
            throw new Error(`Error fetching bookshelf associations: ${e.message}`);
        }
    }

    /**
     * Fetches a bookshelf by its ID, including associated book and user data.
     * @param {number} id - The ID of the bookshelf.
     * @returns {Promise<Bookshelf | null>} - The bookshelf or null if not found.
     */
    async getBookshelfById(id) {
        try {
            const query = `
                SELECT 
                    bookshelf.bookshelf_Id,
                    bookshelf.bookshelf_name,
                    bookshelf.creation_date,
                    book.book_Id,
                    book.title,
                    image.image_front
                FROM 
                    bookshelf
                JOIN 
                    user ON user.user_Id = bookshelf.user_Id
                LEFT JOIN 
                    bookshelf_books ON bookshelf_books.bookshelf_Id = bookshelf.bookshelf_Id
                LEFT JOIN 
                    book ON bookshelf_books.book_Id = book.book_Id
                LEFT JOIN 
                    image ON image.image_Id = book.image_Id
                WHERE 
                     bookshelf.bookshelf_Id = ?;
            `;


            const [rows] = await this.pool.query(query, [id]);


            return rows; // Directly return all the rows
        } catch (e) {
            throw new Error(`Error fetching bookshelf by username: ${e.message}`);
        }
    }


    /**
     * Fetches bookshelves for a specific user by username.
     * @param {string} username - The username of the user.
     * @returns {Promise<Bookshelf[] | null>} - Array of bookshelves or null if none found.
     */
    async getBookshelfByUsername(username) {
        try {
            const query = `
                SELECT 
                    bookshelf.bookshelf_Id,
                    bookshelf.bookshelf_name,
                    bookshelf.creation_date,
                    book.book_Id,
                    image.image_front
                FROM 
                    bookshelf
                JOIN 
                    user ON user.user_Id = bookshelf.user_Id
                LEFT JOIN 
                    bookshelf_books ON bookshelf_books.bookshelf_Id = bookshelf.bookshelf_Id
                LEFT JOIN 
                    book ON bookshelf_books.book_Id = book.book_Id
                LEFT JOIN 
                    image ON image.image_Id = book.image_Id
                WHERE 
                    user.username = ?;
            `;

            const [rows] = await this.pool.query(query, [username]);

            return rows; // Directly return all the rows
        } catch (e) {
            throw new Error(`Error fetching bookshelf by username: ${e.message}`);
        }
    }


    /**
     * Fetches bookshelves by a specific name.
     * @param {string} name - The name of the bookshelf.
     * @returns {Promise<Bookshelf[] | null>} - Array of bookshelves or null if none found.
     */
    async getBookshelfByName(name) {
        try {
            const [rows] = await this.pool.query(`SELECT bookshelf_Id, username,bookshelf_name, creation_date, bookshelf.view 
                FROM bookshelf
                JOIN user ON 
                user.user_Id = bookshelf.user_Id
                WHERE bookshelf_name = ?`, [name]);
            if (rows.length === 0) return null;
            return rows.map(Bookshelf.fromRow);
        } catch (e) {
            throw new Error(`Error fetching bookshelf by name: ${e.message}`);
        }
    }

    /**
     * Fetches bookshelves by their view type.
     * @param {string} view - The view type of the bookshelf.
     * @returns {Promise<Bookshelf[] | null>} - Array of bookshelves or null if none found.
     */
    async getBookshelfByView(username) {
        try {
            const query = `
                SELECT 
                    bookshelf.bookshelf_Id,
                    bookshelf.bookshelf_name,
                    bookshelf.creation_date,
                    book.book_Id,
                    image.image_front
                FROM 
                    bookshelf
                JOIN 
                    user ON user.user_Id = bookshelf.user_Id
                LEFT JOIN 
                    bookshelf_books ON bookshelf_books.bookshelf_Id = bookshelf.bookshelf_Id
                LEFT JOIN 
                    book ON bookshelf_books.book_Id = book.book_Id
                LEFT JOIN 
                    image ON image.image_Id = book.image_Id
                WHERE 
                    user.username = ? and bookshelf.view = 'public';
            `;

            const [rows] = await this.pool.query(query, [username]);

            return rows; // Directly return all the rows
        } catch (e) {
            throw new Error(`Error fetching bookshelf by username: ${e.message}`);
        }
    }

    /**
     * Creates a new bookshelf entry with associated book and user data.
     * @param {Object} bookshelfData - Data for the new bookshelf, including title, username, view, and bookshelf name.
     * @returns {Promise<Bookshelf | string>} - Returns the new bookshelf or error message if creation fails.
     */
    async createBookshelf(bookshelfData) {
        try {
            const { username, view, bookshelf_name } = bookshelfData;

            // Check if the bookshelf name already exists
            const [existingBookshelfRows] = await this.pool.query(
                `SELECT bookshelf_name FROM bookshelf WHERE bookshelf_name = ?`,
                [bookshelf_name]
            );

            if (existingBookshelfRows.length > 0) {
                return 'already exists'; // Bookshelf with the same name already exists
            }

            // Check if the user exists
            const [userRows] = await this.pool.query(
                `SELECT user_Id FROM user WHERE username = ?`,
                [username]
            );

            if (userRows.length === 0) {
                throw new Error(`User with username ${username} not found.`);
            }

            const user_Id = userRows[0].user_Id;

            // Validate `view` field (assuming it should be 'Public' or 'Private')
            if (!['public', 'private'].includes(view)) {
                throw new Error('Invalid view value. Must be either "Public" or "Private".');
            }

            // Insert the new bookshelf entry
            const [result] = await this.pool.query(
                `INSERT INTO bookshelf (user_Id, creation_date, view, bookshelf_name)
                 VALUES (?, NOW(), ?, ?)`,
                [user_Id, view, bookshelf_name]
            );

            // Retrieve and return the new bookshelf entry by its ID
            const [newBookshelf] = await this.pool.query(
                `SELECT * FROM bookshelf WHERE bookshelf_Id = ?`,
                [result.insertId]
            );

            if (newBookshelf.length === 0) {
                throw new Error('Failed to retrieve the created bookshelf.');
            }

            return Bookshelf.fromRow(newBookshelf[0]);
        } catch (e) {
            throw new Error(`Error creating bookshelf: ${e.message}`);
        }
    }


    /**
     * Deletes a bookshelf entry by its ID.
     * @param {number} bookshelf_Id - The ID of the bookshelf.
     * @returns {Promise<boolean>} - Returns true if deletion was successful, otherwise false.
     */
    async deleteBookshelf(bookshelf_Id) {
        try {
            const [check] = await this.pool.query(`DELETE FROM bookshelf_books WHERE bookshelf_id = ?`, [bookshelf_Id]);

            const [result] = await this.pool.query(
                `DELETE FROM bookshelf WHERE bookshelf_Id = ?`,
                [bookshelf_Id]
            );
            return result.affectedRows > 0; // Return whether the deletion was successful
        } catch (e) {
            throw new Error(`Error deleting bookshelf association: ${e.message}`);
        }
    }

    /**
     * Updates an existing bookshelf entry with new data.
     * @param {number} id - The ID of the bookshelf.
     * @param {Object} bookshelfData - The data to update the bookshelf, including book_Id, user_Id, view, and bookshelf_name.
     * @returns {Promise<boolean>} - Returns true if the update was successful, otherwise false.
     */
    async updateBookshelf(id, bookshelfData) {
        try {
            const { view, bookshelf_name } = bookshelfData;

            // Update bookshelf data in the database
            const [Result] = await this.pool.query(
                `UPDATE bookshelf 
                 SET   view = ?, bookshelf_name = ?
                 WHERE bookshelf_Id = ?`,
                [view, bookshelf_name, id]
            );

            // Return whether the update was successful
            return Result.affectedRows > 0;
        } catch (e) {
            throw new Error(`Error updating bookshelf: ${e.message}`);
        }
    }
}

// Exporting the service instance for use in other modules
module.exports = new bookshelfServices();
