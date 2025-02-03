// Importing the database initialization function, models, and related services
const { kernel } = require('sharp');
const { initDB } = require('../Config/database');
const Author = require('../Models/authorModel');
const authorServices = require('./authorServices');
const bookGenreServices = require('./bookGenreServices');
const ImageService = require('./imageServices');

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
  * Retrieves all books from the database, including their authors, genres, and images.
  * Converts the image data from BLOB to Base64 format for display on the frontend.
  * @returns {Promise<Object[]>} - An array of book details including Base64-encoded images.
  * @throws {Error} - Throws an error if the database query fails.
  */
    async getAllBooks() {
        try {
            // Query to fetch all books along with their authors, genres, and images
            const [rows] = await this.pool.query(`
            SELECT 
                book.book_Id AS id, -- Book ID
                author.author_Id, -- Author ID
                author.first_name, -- Author's first name
                author.last_name, -- Author's last name
                book.title, -- Book title
                book.language, -- Book language
                book.date_published AS date, -- Publication date
                book.page_count, -- Number of pages in the book
                book.description, -- Book description
                image.image_front AS imageData, -- Image data (blob) from the image table
                GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres -- Concatenate genres for the book
            FROM book
            JOIN author ON book.author_Id = author.author_Id -- Join with the author table
            JOIN bookgenre ON bookgenre.book_Id = book.book_Id -- Join with the book-genre association table
            JOIN genre ON bookgenre.genre_Id = genre.genre_Id -- Join with the genre table
            JOIN image ON book.image_Id = image.image_Id -- Join with the image table
            GROUP BY book.book_Id -- Group by book ID to avoid duplicate rows
        `);

            // Map over the results to convert them into the desired structure
            const books = rows.map((row) => {
                const author = Author.fromRow(row); // Create an Author object for each row

                let base64Image = null;
                if (row.imageData) {
                    // Convert image data from BLOB to Base64 string format
                    base64Image = row.imageData.toString('base64');
                }


                // Return the formatted book object
                return {
                    id: row.id, // Book ID
                    title: row.title, // Book title
                    date: row.date, // Publication date
                    language: row.language, // Book language
                    page_count: row.page_count, // Number of pages
                    description: row.description, // Book description
                    image: base64Image, // Base64 image data
                    author: `${author.last_name}, ${author.first_name}`, // Formatted author name
                    genres: row.genres ? row.genres.split(', ') : [] // Convert genres into an array
                };
            });

            return books; // Return the array of books
        } catch (e) {
            // Throw an error if the query fails
            throw new Error(`Error fetching books: ${e.message}`);
        }
    }

    /**
     * Retrieves a specific book by its ID from the database.
     * Includes the author, genres, and the book's image converted to Base64 format.
     * @param {number} id - The ID of the book to retrieve.
     * @returns {Promise<Object|null>} - Returns the book details or null if not found.
     * @throws {Error} - Throws an error if the database query fails.
     */
    async getBookById(id) {
        try {
            // Query to fetch a specific book by its ID along with author, genre, and image details
            const [rows] = await this.pool.query(`
            SELECT 
                book.book_Id AS id, -- Book ID
                author.author_Id, -- Author ID
                author.first_name, -- Author's first name
                author.last_name, -- Author's last name
                book.title, -- Book title
                book.language, -- Book language
                book.date_published AS date, -- Publication date
                book.page_count, -- Number of pages in the book
                book.description, -- Book description
                book.ISBN,
                image.image_front AS imageData, -- Image data (blob) from the image table
                GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres -- Concatenate genres for the book
            FROM book
            JOIN author ON book.author_Id = author.author_Id -- Join with the author table
            JOIN bookgenre ON bookgenre.book_Id = book.book_Id -- Join with the book-genre association table
            JOIN genre ON bookgenre.genre_Id = genre.genre_Id -- Join with the genre table
            JOIN image ON book.image_Id = image.image_Id -- Join with the image table
            WHERE book.book_Id = ? -- Filter by the provided book ID
            GROUP BY book.book_Id -- Group by book ID to avoid duplicate rows
        `, [id]);

            if (rows.length === 0) return null; // Return null if no book is found

            const row = rows[0]; // Get the first row (there will only be one)
            const author = Author.fromRow(row); // Create an Author object for the row

            let base64Image = null;
            if (row.imageData) {
                // Convert image data from BLOB to Base64 string format
                base64Image = row.imageData.toString('base64');
            }

            // Return the formatted book object
            return {
                id: row.id, // Book ID
                title: row.title, // Book title
                date: row.date,
                ISBN: row.ISBN, // Publication date
                language: row.language, // Book language
                page_count: row.page_count, // Number of pages
                description: row.description, // Book description
                image: base64Image, // Base64 image data
                author: `${author.last_name}, ${author.first_name}`, // Formatted author name
                genres: row.genres ? row.genres.split(', ') : [] // Convert genres into an array
            };
        } catch (e) {
            // Throw an error if the query fails
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
    // Import ImageService

    async createBook(bookData) {
        try {
            const { title, first_name, last_name, ISBN, count, language, date, genres, description, image } = bookData;

            if (!Array.isArray(genres) || genres.length === 0) {
                throw new Error('Invalid or missing genres');
            }

            const [rows] = await this.pool.query(
                `SELECT author_Id FROM author WHERE first_name = ? AND last_name = ?`,
                [first_name, last_name]
            );

            let authorId = rows.length ? rows[0].author_Id : null;

            if (!authorId) {
                const createdAuthor = await authorServices.createAuthor({ first_name, last_name });
                authorId = createdAuthor.author_Id;
                if (!authorId) throw new Error('Failed to create author');
            }

            let imageId = null;
            if (image) {
                const createdImage = await ImageService.createImage(image); // Save Base64 image
                imageId = createdImage.id;
            }

            const [result] = await this.pool.query(
                `INSERT INTO book (title, ISBN, page_count, language, date_published, author_Id, description, image_Id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, ISBN, count, language, date, authorId, description, imageId]
            );

            if (!result.insertId) throw new Error('Failed to create book');

            for (const genreName of genres) {
                const [genreRows] = await this.pool.query(`SELECT genre_Id FROM genre WHERE genre_name = ?`, [genreName]);
                let genreId = genreRows.length ? genreRows[0].genre_Id : null;

                if (!genreId) {
                    const [genreResult] = await this.pool.query(`INSERT INTO genre (genre_name) VALUES (?)`, [genreName]);
                    genreId = genreResult.insertId;
                }

                await bookGenreServices.createBookGenre({ book_Id: result.insertId, genre_Id: genreId });
            }

            return await this.getBookById(result.insertId);
        } catch (e) {
            console.error('Error creating book:', e);
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
    async searchBook(search) {
        try {
            const keyword = `%${search}%`; // Format the search term for partial matching

            const query = `
                SELECT 
                    book.book_Id AS id,
                    CONCAT(author.last_name, ', ', author.first_name) AS author,
                    book.title,
                    book.language,
                    book.date_published AS date,
                    book.page_count,
                    book.description,
                    image.image_front AS imageData,
                    GROUP_CONCAT(genre.genre_name SEPARATOR ', ') AS genres
                FROM book
                JOIN author ON book.author_id = author.author_id
                JOIN bookgenre ON bookgenre.book_Id = book.book_Id
                JOIN genre ON bookgenre.genre_Id = genre.genre_id
                JOIN image ON book.image_Id = image.image_Id
                WHERE 
                    book.title LIKE ? 
                    OR genre.genre_name LIKE ? 
                    OR author.first_name LIKE ?
                    OR author.last_name LIKE ?
                GROUP BY book.book_Id;
            `;

            const queryParams = [keyword, keyword, keyword, keyword];
            const [rows] = await this.pool.query(query, queryParams);

            if (!rows || rows.length === 0) {
                return []; // Return an empty array if no results
            }

            // Map rows to book objects
            return rows.map(row => ({
                id: row.id,
                title: row.title,
                date: row.date,
                language: row.language,
                page_count: row.page_count,
                description: row.description,
                image: row.imageData ? row.imageData.toString('base64') : null,
                author: row.author,
                genres: row.genres ? row.genres.split(', ') : []
            }));
        } catch (e) {
            throw new Error(`Error searching for book: ${e.message}`);
        }
    }

}

module.exports = new bookService(); // Export an instance of the bookService
