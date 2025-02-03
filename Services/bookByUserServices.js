const { initDB } = require('../Config/database');
const BookByUser = require('../Models/bookByUserModel');
const userService = require('../Services/userServices');
const bookService = require('../Services/bookServices');

class bookByUserService {
    constructor() {
        this.pool = null; // Initialize the database connection pool as null
        this.init(); // Initialize the database connection pool
    }

    /**
     * Initializes the database connection pool.
     * This method is called automatically when an instance of the service is created.
     */
    async init() {
        this.pool = await initDB();
    }

    /**
     * Fetches all books associated with users, including book titles.
     * Joins bookByUser and book tables.
     * @returns {Promise<Object[]>} - An array of all books associated with users.
     */
    async getAllBookByUser() {
        try {
            const [rows] = await this.pool.query(`SELECT booksbyuser.*, title FROM booksbyuser
                JOIN book ON book.book_Id = booksbyuser.book_Id`);
            return rows.map(BookByUser.fromRow); // Assumes User.fromRow maps database rows to objects
        } catch (e) {
            throw new Error(`Error fetching users: ${e.message}`);
        }
    }

    /**
     * Fetches a bookByUser record by its unique ID.
     * Joins bookByUser and book tables to include the book title.
     * @param {number} id - The unique ID for bookByUser.
     * @returns {Promise<Object|null>} - The bookByUser record or null if not found.
     */
    async getbookByUserById(id) {
        try {
            const [rows] = await this.pool.query(`SELECT booksbyuser.*, title FROM booksByUser
                JOIN book ON book.book_Id = booksbyuser.book_Id
                WHERE books_user_Id = ?`, [id]);
            if (rows.length === 0) return null;
            return BookByUser.fromRow(rows[0]);
        } catch (e) {
            throw new Error(`Error fetching book by ID: ${e.message}`);
        }
    }



    /**
     * Gets the total count of books associated with users in the system.
     * @returns {Promise<number>} - Total number of books associated with users.
     */
    async getTotalBooks(user_Id) {
        try {
            const [result] = await this.pool.query(
                `SELECT count(books_user_Id) AS total FROM booksbyuser WHERE user_Id = ?`,
                [user_Id]
            );

            return result[0].total + " books";
        } catch (e) {
            throw new Error(`Error fetching books: ${e.message}`);
        }
    }

    /**
     * Gets the total count of books with status "read" in bookByUser.
     * @returns {Promise<number>} - Total number of books with status "read".
     */
    async getTotalBooksRead(user_Id) {
        try {
            const [rows] = await this.pool.query(
                `SELECT COUNT(*) AS total FROM booksbyuser WHERE status = "read" AND user_Id = ?`,
                [user_Id]
            );
            return rows[0].total + " books read";
        } catch (e) {
            throw new Error(`Error fetching books: ${e.message}`);
        }
    }



    /**
     * Recommends unread books by the user's most-read author.
     * @param {number} userId - The ID of the user for recommendations.
     * @returns {Promise<Object[]|string>} - List of book recommendations or message if no unread books.
     */
    async getRecommendationByMostReadAuthor(user) {

        try {
            const [mostReadAuthorRows] = await this.pool.query(`
                SELECT book.author_Id, COUNT(booksbyuser.book_Id) AS read_count
                FROM booksByUser
                JOIN book ON book.book_Id = booksbyuser.book_Id
                WHERE booksbyuser.status = 'read' AND booksbyuser.user_Id = ?
                GROUP BY book.author_Id
                ORDER BY read_count DESC
                LIMIT 1
            `, [user]);

            if (mostReadAuthorRows.length === 0) return 'No books read yet by the user.';

            const mostReadAuthorId = mostReadAuthorRows[0].author_Id;
            const [unreadBooksByAuthor] = await this.pool.query(`
                SELECT book.book_Id AS id, author.author_Id, author.first_name, author.last_name,
                       book.title, book.language, book.date_published AS date, book.ISBN, book.page_count,
                       book.description, GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_Id = author.author_Id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id
                JOIN booksbyuser ON booksbyuser.book_Id = book.book_Id
                WHERE  
                book.author_Id = ?
                GROUP BY book.book_Id
            `, [mostReadAuthorId, user]);

            if (unreadBooksByAuthor.length === 0) return `No unread books found by the most-read author.`;
            return unreadBooksByAuthor.map(book => ({
                id: book.id, title: book.title, language: book.language, date: book.date,
                ISBN: book.ISBN, page_count: book.page_count, description: book.description, genres: book.genres
            }));
        } catch (e) {
            throw new Error(`Error fetching book recommendations: ${e.message}`);
        }
    }

    /**
     * Recommends unread books by the user's most-read author.
     * @param {number} userId - The ID of the user for recommendations.
     * @returns {Promise<Object[]|string>} - List of book recommendations or message if no unread books.
     */
    async getRecommendationByMostReadGenre(user) {
        try {
            // Query to find the most-read genre by the user
            const [mostReadGenreRows] = await this.pool.query(`
                SELECT bookgenre.genre_Id, COUNT(booksbyuser.book_Id) AS read_count
                FROM booksbyuser
                JOIN book ON book.book_Id = booksbyuser.book_Id
                JOIN bookgenre ON book.book_Id = bookgenre.book_Id
                WHERE booksbyuser.status = 'read' AND booksbyuser.user_Id = ?
                GROUP BY bookgenre.genre_Id
                ORDER BY read_count DESC
                LIMIT 1
            `, [user]);

            if (mostReadGenreRows.length === 0) return 'No books read yet by the user.';

            const mostReadGenreId = mostReadGenreRows[0].genre_Id;

            // Query to find unread books by the most-read genre
            const [unreadBooksByGenre] = await this.pool.query(`
                SELECT book.book_Id AS id, author.author_Id, author.first_name, author.last_name,
                       book.title, book.language, book.date_published AS date, book.ISBN, book.page_count,
                       book.description, GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_Id = author.author_Id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id
                LEFT JOIN booksbyuser ON booksbyuser.book_Id = book.book_Id AND booksbyuser.user_Id = ?
                WHERE bookgenre.genre_Id = ? AND (booksbyuser.status IS NULL OR booksbyuser.status != 'read')
                GROUP BY book.book_Id
            `, [user, mostReadGenreId]);

            if (unreadBooksByGenre.length === 0) return `No unread books found in the most-read genre.`;

            return unreadBooksByGenre.map(book => ({
                id: book.id,
                title: book.title,
                language: book.language,
                date: book.date,
                ISBN: book.ISBN,
                page_count: book.page_count,
                description: book.description,
                genres: book.genres
            }));
        } catch (e) {
            throw new Error(`Error fetching book recommendations: ${e.message}`);
        }
    }


    /**
     * Creates a bookByUser entry associating a user with a book.
     * @param {Object} data - Data including start, end dates, username, book title, etc.
     * @returns {Promise<Object>} - The newly created bookByUser record.
     * @throws {Error} - Throws error if required parameters are missing or invalid.
     */
    async createBookByUser(data) {
        try {
            const { start, end, username, title, status, current } = data;

            // Fetch user and book IDs based on username and title
            const user_Id = (await userService.getUserByUsername(username)).id;
            const [bookRows] = await this.pool.query(`SELECT book_Id FROM book WHERE title = ?`, [title]);

            const book_Id = bookRows[0].book_Id;

            console.log(user_Id);
            console.log(book_Id);
            if (!['read', 'unread', 'reading'].includes(status)) {
                throw new Error(`Invalid status; must be one of: read, unread, reading.`);
            }
            if (!user_Id || !book_Id)
                return ('User or book does not exist.');

            const [result] = await this.pool.query(
                `INSERT INTO booksbyuser (book_Id, user_Id, status, start_date, end_date, current_page)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [book_Id, user_Id, status, start, end, current]
            );

            return await this.getbookByUserById(result.insertId);
        } catch (e) {
            throw new Error(`Error creating book: ${e.message}`);
        }
    }

    /**
     * Updates a bookByUser record with new data.
     * @param {number} id - The ID of the bookByUser record to update.
     * @param {Object} data - Data including start, end dates, status, and current page.
     * @returns {Promise<Object>} - The updated bookByUser record.
     */
    async updateBookByUser(id, data) {
        try {
            const { start, end, status, current } = data;

            if (!['read', 'unread', 'reading'].includes(status)) {
                throw new Error(`Invalid status; must be one of: read, unread, reading.`);
            }

            const [result] = await this.pool.query(
                `UPDATE booksbyuser SET start_date = ?, end_date = ?, status = ?, current_page = ?
                 WHERE books_user_Id = ?`,
                [start, end, status, current, id]
            );

            if (result.affectedRows === 0) throw new Error(`Book with ID ${id} not found or no changes made`);
            return await this.getbookByUserById(id);
        } catch (e) {
            throw new Error(`Error updating book: ${e.message}`);
        }
    }

    /**
     * Deletes a bookByUser record based on its unique ID.
     * @param {number} id - The ID of the bookByUser record to delete.
     * @returns {Promise<boolean>} - True if deletion was successful, false otherwise.
     */
    async deleteBookByUser(id) {
        try {
            const [result] = await this.pool.query(`DELETE FROM booksbyuser WHERE books_user_Id = ?`, [id]);
            return result.affectedRows > 0;
        } catch (e) {
            throw new Error(`Error deleting book: ${e.message}`);
        }
    }
}

module.exports = new bookByUserService();
