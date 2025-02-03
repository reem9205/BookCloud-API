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
            const [rows] = await this.pool.query(
                `SELECT image.image_front, image.image_Id, book.book_Id, booksbyuser.books_user_Id
                 FROM virtuallibrary.booksbyuser
                 NATURAL JOIN virtuallibrary.book
                 LEFT JOIN virtuallibrary.image ON book.image_id = image.image_id
                 WHERE booksbyuser.user_Id = ?`,
                [id]
            );

            // If no rows are returned
            if (rows.length === 0) {
                return null;
            }

            // Map the rows to extract the required data
            return rows.map((row) => {
                let base64Image = null;
                if (row.image_front) {
                    // Convert image data from BLOB to Base64 string format
                    base64Image = row.image_front.toString('base64');
                }

                return {
                    id: row.image_Id, // Image ID
                    image: base64Image, // Base64 image data
                    book_Id: row.book_Id,
                    books_user_Id: row.books_user_Id // Book ID
                };
            });
        } catch (e) {
            console.error(`Error fetching book by user ID: ${e.message}`);
            throw new Error(`Error fetching book by user ID: ${e.message}`);
        }
    }

    /**
     * Fetches a bookByUser record by its unique ID.
     * Joins bookByUser and book tables to include the book title.
     * @param {number} id - The unique ID for user and book ids.
     * @returns {Promise<Object|null>} - The bookByUser record or null if not found.
     */
    async getUserBookById(user_Id, book_Id) {
        try {


            const [rows] = await this.pool.query(
                `
                SELECT 
                    book.book_Id AS id, 
                    book.title, 
                    book.language, 
                    book.date_published AS date, 
                    book.page_count, 
                    book.description, 
                    book.ISBN,
                    image.image_front AS imageData,
                    GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres,
                    CONCAT(author.first_name, ' ', author.last_name) AS author,
                    booksbyuser.status,
                    booksbyuser.current_page,
                    booksbyuser.start_date,
                    booksbyuser.end_date,
                    booksbyuser.books_user_Id
                FROM book
                JOIN author ON book.author_Id = author.author_Id 
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id 
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id 
                JOIN image ON book.image_Id = image.image_Id
                LEFT JOIN booksbyuser ON booksbyuser.book_Id = book.book_Id
                WHERE book.book_Id = ? AND booksbyuser.user_Id = ?
                GROUP BY book.book_Id, image.image_front, author.first_name, author.last_name, booksbyuser.status, 
                         booksbyuser.current_page, booksbyuser.start_date, booksbyuser.end_date, booksbyuser.books_user_Id
                `,
                [book_Id, user_Id]
            );



            if (rows.length === 0) {
                console.warn('No matching book found for the given user_Id and book_Id.');
                return null;
            }

            const row = rows[0];

            // Convert image data to Base64
            const base64Image = row.imageData ? row.imageData.toString('base64') : null;

            return {
                id: row.id,
                relation: row.books_user_Id,
                title: row.title,
                date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
                ISBN: row.ISBN,
                status: row.status || 'Not Available', // Default to "Not Available" if null
                current_page: row.current_page || 0, // Default to 0 if null
                start_date: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : null,
                end_date: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : null,
                language: row.language,
                page_count: row.page_count,
                description: row.description || 'No description available.',
                image: base64Image,
                author: row.author || 'Unknown Author',
                genres: row.genres ? row.genres.split(', ') : []
            };
        } catch (e) {
            console.error(`Error fetching book for user: ${e.message}`);
            throw new Error(`Error fetching book for user: ${e.message}`);
        }
    }


    async getBookReading(user_Id) {
        try {
            const [rows] = await this.pool.query(
                `
                SELECT 
                    book.book_Id AS id, 
                    book.title, 
                    book.language, 
                    book.date_published AS date, 
                    book.page_count, 
                    book.description, 
                    book.ISBN,
                    image.image_front AS imageData,
                    GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres,
                    CONCAT(author.first_name, ' ', author.last_name) AS author,
                    booksbyuser.status,
                    booksbyuser.current_page,
                    booksbyuser.start_date,
                    booksbyuser.end_date,
                    booksbyuser.books_user_Id
                FROM book
                JOIN author ON book.author_Id = author.author_Id 
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id 
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id 
                JOIN image ON book.image_Id = image.image_Id
                LEFT JOIN booksbyuser ON booksbyuser.book_Id = book.book_Id
                WHERE booksbyuser.status = "reading" AND booksbyuser.user_Id = ?
                GROUP BY book.book_Id, image.image_front, author.first_name, author.last_name, booksbyuser.status, 
                         booksbyuser.current_page, booksbyuser.start_date, booksbyuser.end_date, booksbyuser.books_user_Id
                `,
                [user_Id]
            );



            if (!rows || rows.length === 0) {
                console.warn('No matching books found for the given user_Id.');
                return [];
            }

            // Process each row into a structured book object
            const books = rows.map(row => {
                const percentage = (row.current_page / row.page_count) * 100;

                // Convert image data to Base64
                const base64Image = row.imageData ? row.imageData.toString('base64') : null;

                return {
                    id: row.id,
                    relation: row.books_user_Id,
                    title: row.title,
                    date: row.date ? new Date(row.date).toISOString().split('T')[0] : null,
                    ISBN: row.ISBN,
                    percentage: percentage,
                    status: row.status || 'Not Available',
                    current_page: row.current_page || 0,
                    start_date: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : null,
                    end_date: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : null,
                    language: row.language,
                    page_count: row.page_count,
                    description: row.description || 'No description available.',
                    image: base64Image,
                    author: row.author || 'Unknown Author',
                    genres: row.genres ? row.genres.split(', ') : []
                };
            });

            return books;
        } catch (e) {
            console.error(`Error fetching books for user: ${e.message}`);
            throw new Error(`Error fetching books for user: ${e.message}`);
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


            return result[0].total + " Books";
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
            return rows[0].total;
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
            // Query to find the most-read author by the user
            const [mostReadAuthorRows] = await this.pool.query(`
                SELECT book.author_Id, COUNT(booksbyuser.book_Id) AS read_count
                FROM booksbyuser
                JOIN book ON book.book_Id = booksbyuser.book_Id
                WHERE booksbyuser.status = 'read' AND booksbyuser.user_Id = ?
                GROUP BY book.author_Id
                ORDER BY read_count DESC
                LIMIT 1
            `, [user]);

            // If no books are read by the user
            if (mostReadAuthorRows.length === 0) return [];

            const mostReadAuthorId = mostReadAuthorRows[0].author_Id;

            // Query to find unread books by the most-read author
            const [unreadBooksByAuthor] = await this.pool.query(`
                SELECT book.book_Id AS id, author.author_Id, author.first_name, author.last_name,
                       book.title, book.language, book.date_published AS date, book.ISBN, book.page_count,
                       book.description, GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_Id = author.author_Id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id
                LEFT JOIN booksbyuser ON booksbyuser.book_Id = book.book_Id AND booksbyuser.user_Id = ?
                WHERE book.author_Id = ? AND (booksbyuser.status IS NULL OR booksbyuser.status != 'read')
                GROUP BY book.book_Id
            `, [user, mostReadAuthorId]);

            // If no unread books are found
            if (unreadBooksByAuthor.length === 0) return [];

            // Format and return the unread books
            return unreadBooksByAuthor.map(book => ({
                id: book.id,
                title: book.title,
                language: book.language,
                date: book.date,
                ISBN: book.ISBN,
                page: book.page_count,
                description: book.description,
                genres: book.genres
            }));
        } catch (e) {
            throw new Error(`Error fetching book recommendations by author: ${e.message}`);
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

            if (mostReadGenreRows.length === 0) return []; // No books read yet

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

            if (unreadBooksByGenre.length === 0) return []; // No unread books found

            // Return formatted books
            return unreadBooksByGenre.map(book => ({
                id: book.id,
                title: book.title,
                language: book.language,
                date: book.date,
                ISBN: book.ISBN,
                page: book.page_count,
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

            // Fetch user_Id based on username
            const [userRows] = await this.pool.query(
                `SELECT user_Id FROM user WHERE username = ?`,
                [username]
            );
            if (userRows.length === 0) {
                throw new Error(`User with username "${username}" does not exist.`);
            }
            const user_Id = userRows[0].user_Id;

            // Fetch book_Id based on title
            const [bookRows] = await this.pool.query(
                `SELECT book_Id FROM book WHERE title = ?`,
                [title]
            );
            if (bookRows.length === 0) {
                throw new Error(`Book with title "${title}" does not exist.`);
            }
            const book_Id = bookRows[0].book_Id;

            // Check if the book is already in the user's collection
            const [existingRows] = await this.pool.query(
                `SELECT * FROM booksbyuser WHERE user_Id = ? AND book_Id = ?`,
                [user_Id, book_Id]
            );

            if (existingRows.length > 0) {
                // If a duplicate is found, return a message instead of throwing an error
                return { message: `The book "${title}" is already in the user's collection.` };
            }

            // Insert into booksbyuser table
            const [result] = await this.pool.query(
                `INSERT INTO booksbyuser (book_Id, user_Id, status, start_date, end_date, current_page)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [book_Id, user_Id, status, start || null, end || null, current || null]
            );

            // Return the insertion result
            return { message: `The book "${title}" was successfully added to the user's collection.`, result };
        } catch (e) {
            console.error(`Error creating book: ${e.message}`);
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
            const { start_date, end_date, status, current_page } = data;

            if (!['read', 'unread', 'reading'].includes(status)) {
                throw new Error(`Invalid status; must be one of: read, unread, reading.`);
            }

            const [result] = await this.pool.query(
                `UPDATE booksbyuser SET start_date = ?, end_date = ?, status = ?, current_page = ?
                 WHERE books_user_Id = ?`,
                [start_date || null, end_date || null, status, current_page, id]
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
