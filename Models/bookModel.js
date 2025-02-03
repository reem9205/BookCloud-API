// Book class representing a book entity in the library system
class Book {
    /**
     * Constructor to initialize a Book object.
     * @param {number} id - Unique ID of the book
     * @param {string} title - Title of the book
     * @param {string} date - Publication date of the book
     * @param {string} language - Language of the book
     * @param {number} page_count - Total pages in the book
     * @param {string} ISBN - ISBN number of the book
     * @param {number} author_Id - ID of the author who wrote the book
     * @param {number} image_Id - ID of the book's associated image
     * @param {string} description - Brief description of the book
     */
    constructor(id, title, date, language, page_count, ISBN, author_Id, image_Id, description) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.language = language;
        this.page_count = page_count;
        this.author_Id = author_Id;
        this.image_Id = image_Id;
        this.ISBN = ISBN;
        this.description = description;
    }

    /**
     * Static method to create a Book instance from a database row.
     * @param {object} row - The database row containing Book data
     * @returns {Book} - New Book instance
     */
    static fromRow(row) {
        return new Book(
            row.book_Id,            // Book ID from the database
            row.title,              // Title of the book
            row.language,           // Language of the book
            row.date_published,     // Date the book was published
            row.page_count,         // Total number of pages in the book
            row.image_Id,           // ID of the associated image for the book
            row.author_Id,          // ID of the author of the book
            row.ISBN,               // ISBN number of the book
            row.description         // Brief description of the book
        );
    }
}

// Exporting the Book class for use in other modules
module.exports = Book;
