// Importing the database initialization function, models, and related services
const { initDB } = require('../Config/database');
const Author = require('../Models/authorModel');
const authorServices = require('./authorServices');
const bookGenreServices = require('./bookGenreServices');

class bookService {
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
     * Fetches all books from the database, including author and genre information.
     * Joins the book, author, and genre tables based on their relationships.
     * @returns {Promise<Object[]>} - Returns an array of book details.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllBooks() {
        try {
            const [rows] = await this.pool.query(`
                SELECT 
                    book.book_Id AS id, 
                    author.author_Id,
                    author.first_name,
                    author.last_name,
                    book.title,
                    book.language,
                    book.date_published AS date,
                    book.ISBN AS image_Id,
                    book.page_count,
                    book.description,
                    GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_Id = author.author_Id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id
                GROUP BY book.book_Id
            `);

            // Map each row to a formatted book object
            return rows.map(row => {
                const author = Author.fromRow(row);

                return {
                    id: row.id,
                    title: row.title,
                    date: row.date,
                    language: row.language,
                    page_count: row.page_count,
                    description: row.description,
                    image_Id: row.image_Id,
                    author: `${author.last_name}, ${author.first_name}`,  // Format author name
                    genres: row.genres ? row.genres.split(', ') : []  // Handle null or undefined genres
                };
            });

        } catch (e) {
            throw new Error(`Error fetching books: ${e.message}`);
        }
    }

    /**
     * Fetches a specific book by its ID, including author and genre information.
     * @param {number} id - The ID of the book.
     * @returns {Promise<Object|null>} - Returns book details or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getBookById(id) {
        try {
            const [rows] = await this.pool.query(`
                SELECT 
                    book.book_Id AS id, 
                    author.author_Id,
                    author.first_name,
                    author.last_name,
                    book.title,
                    book.language,
                    book.date_published AS date,
                    book.ISBN,
                    book.page_count,
                    book.description,
                    GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_Id = author.author_Id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id
                WHERE book.book_Id = ? 
                GROUP BY book.book_Id
            `, [id]);

            if (rows.length === 0) return null; // Return null if book is not found

            const row = rows[0];
            const author = Author.fromRow(row); // Create Author instance

            return {
                id: row.id,
                title: row.title,
                date: row.date,
                language: row.language,
                page_count: row.page_count,
                description: row.description,
                image_Id: row.image_Id,
                author: `${author.last_name}, ${author.first_name}`,  // Format author name
                genres: row.genres.split(', ')
            };

        } catch (e) {
            throw new Error(`Error fetching book by ID: ${e.message}`);
        }
    }

    /**
     * Fetches a book by its title, including author and genre information.
     * @param {string} title - The title of the book.
     * @returns {Promise<Object|null>} - Returns book details or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getBookByTitle(title) {
        try {
            const [rows] = await this.pool.query(`
                SELECT 
                    book.book_Id AS id, 
                    author.author_Id,
                    author.first_name,
                    author.last_name,
                    book.title,
                    book.language,
                    book.date_published AS date,
                    book.ISBN,
                    book.page_count,
                    book.description,
                    GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_Id = author.author_Id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_Id
                WHERE book.title = ? 
                GROUP BY book.book_Id
            `, [title]);

            if (rows.length === 0) return null; // Return null if book is not found

            const row = rows[0];
            const author = Author.fromRow(row); // Create Author instance

            return {
                id: row.id,
                title: row.title,
                date: row.date,
                language: row.language,
                page_count: row.page_count,
                description: row.description,
                ISBN: row.ISBN,
                author: `${author.last_name}, ${author.first_name}`,  // Format author name
                genres: row.genres.split(', ')
            };

        } catch (e) {
            throw new Error(`Error fetching book by title: ${e.message}`);
        }
    }

    /**
     * Creates a new book in the database with associated genres.
     * Ensures the author and genres exist before creating associations.
     * @param {Object} bookData - Book details including author and genre information.
     * @returns {Promise<Object>} - Returns the newly created book details.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createBook(bookData) {
        try {
            const { title, first_name, last_name, ISBN, count, language, date, genres, description } = bookData;

            const [row] = await this.pool.query(`SELECT book_Id FROM book WHERE ISBN = ?`, [ISBN]);

            // Check if the genre was found
            if (row.length > 0) {
                return 'ISBN already exsists'; // Username not found, return false
            }

            // Ensure the author exists
            let [rows] = await this.pool.query(
                `SELECT author_Id FROM author WHERE first_name = ? AND last_name = ?`,
                [first_name, last_name]
            );

            let authorId;
            if (rows.length > 0) {
                authorId = rows[0].author_Id;
            } else {
                authorId = (await (authorServices.createAuthor({ first_name, last_name }))).author_Id;
                if (!authorId) throw new Error('Failed to create author');
            }

            // Insert the new book
            const [result] = await this.pool.query(
                `INSERT INTO book (title, ISBN, page_count, language, date_published, author_Id, description)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, ISBN, count, language, date, authorId, description]
            );

            const bookId = result.insertId;
            if (!bookId) throw new Error('Failed to create book');

            // Ensure each genre exists and create associations
            for (let genreName of genres) {
                let [genreRows] = await this.pool.query(
                    `SELECT genre_Id FROM genre WHERE genre_name = ?`, [genreName]
                );

                let genreId;
                if (genreRows.length === 0) {
                    const [genreResult] = await this.pool.query(
                        `INSERT INTO genre (genre_name) VALUES (?)`, [genreName]
                    );
                    genreId = genreResult.insertId;
                } else {
                    genreId = genreRows[0].genre_Id;
                }

                if (!genreId) throw new Error(`Failed to retrieve or create genre: ${genreName}`);

                await bookGenreServices.createBookGenre({ book_Id: bookId, genre_Id: genreId });
            }

            return await this.getBookById(bookId);

        } catch (e) {
            throw new Error(`Error creating book: ${e.message}`);
        }
    }

    async updateBook(id, bookData) {
        try {
            const { title, first_name, last_name, ISBN, page_count, language, date, genres, description } = bookData;

            // Step 1: Check if the author exists; if not, create them
            let [rows] = await this.pool.query(
                `SELECT author_Id FROM author WHERE first_name = ? AND last_name = ?`,
                [first_name, last_name]
            );

            let authorId;
            if (rows.length > 0) {
                // Author exists, retrieve their ID
                authorId = rows[0].author_Id;
            } else {
                // Author doesn't exist, so create a new author and retrieve their ID
                const { insertId } = (await authorServices.createAuthor({ first_name, last_name })).author_Id;
                authorId = insertId;

            }

            // Step 2: Update the book's information in the database
            const [bookResult] = await this.pool.query(
                `UPDATE book
                 SET title = ?, ISBN = ?, page_count = ?, language = ?, date_published = ?, author_Id = ?, description = ?
                 WHERE book_Id = ?`,
                [title, ISBN, page_count, language, date, authorId, description, id]
            );

            // Check if the book update was successful
            if (bookResult.affectedRows === 0) {
                throw new Error(`Book with ID ${id} not found or no changes made`);
            }

            // Step 3: Remove existing genre associations for the book
            await this.pool.query(`DELETE FROM bookgenre WHERE book_Id = ?`, [id]);

            // Step 4: Ensure each genre exists; if not, create it, then associate it with the book
            for (let genreName of genres) {
                // Check if the genre already exists
                let [genreRows] = await this.pool.query(
                    `SELECT genre_Id FROM genre WHERE genre_name = ?`,
                    [genreName]
                );

                let genreId;
                if (genreRows.length === 0) {
                    // Genre doesn't exist, so create a new genre
                    const [genreResult] = await this.pool.query(
                        `INSERT INTO genre (genre_name) VALUES (?)`,
                        [genreName]
                    );
                    genreId = genreResult.insertId;
                    console.log(`New genre created: ${genreName} with genreId: ${genreId}`);
                } else {
                    // Genre exists, retrieve its ID
                    genreId = genreRows[0].genre_Id;
                    console.log(`Found existing genre: ${genreName} with genreId: ${genreId}`);
                }

                if (!genreId) throw new Error(`Failed to retrieve or create genre: ${genreName}`);

                // Create the association between the book and genre in the bookgenre table
                await bookGenreServices.createBookGenre({ book_Id: id, genre_Id: genreId });
            }

            // Step 5: Retrieve and return the updated book with its genre information
            return await this.getBookById(id);

        } catch (e) {
            throw new Error(`Error updating book: ${e.message}`);
        }
    }

    async deleteBook(id) {
        try {
            // Step 1: Delete associations from the `bookgenre` table for the given book ID
            await this.pool.query(`DELETE FROM bookgenre WHERE book_Id = ?`, [id]);

            // Step 2: Delete associations from the `bookshelf` table for the given book ID
            await this.pool.query(`DELETE FROM bookshelf_books WHERE book_Id = ?`, [id]);

            // Step 3: Delete associations from the `userByBook` table for the given book ID
            await this.pool.query(`DELETE FROM booksbyuser WHERE book_Id = ?`, [id]);

            // Step 4: Delete the book from the `book` table based on its ID
            const [result] = await this.pool.query(`DELETE FROM book WHERE book_Id = ?`, [id]);

            // Return true if a row was deleted from the `book` table, false otherwise
            return result.affectedRows > 0;
        } catch (e) {
            throw new Error(`Error deleting book: ${e.message}`);
        }
    }



    /**
     * Searches for books based on a search term across multiple fields.
     * @param {string} searchWord - The search term to match across fields.
     * @returns {Promise<Object[]>} - Returns an array of matching books.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async searchBook(searchWord) {
        try {
            const keyword = `%${searchWord}%`; // Format the search term for partial matching

            const query = `
                SELECT 
                    book.book_Id,
                    CONCAT(author.last_name, ', ', author.first_name) AS author,
                    book.title,
                    book.language,
                    book.date_published,
                    book.ISBN,
                    book.page_count,
                    book.description,
                    GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_id = author.author_id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_id
                WHERE 
                    book.title LIKE ? 
                    OR genre.genre_name LIKE ? 
                    OR author.first_name LIKE ?
                    OR author.last_name LIKE ?
                GROUP BY book.book_Id;
            `;

            const queryParams = [keyword, keyword, keyword, keyword];
            const [rows] = await this.pool.query(query, queryParams);

            return rows;

        } catch (e) {
            throw new Error(`Error searching for book: ${e.message}`);
        }
    }
}

module.exports = new bookService(); // Export an instance of the bookService
