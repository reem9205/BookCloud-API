const e = require('express');
const bookByUserService = require('../Services/bookByUserServices');

class BookByUserController {
    /**
     * Fetches all books associated with users.
     * Responds with a list of all books associated with users.
     */
    async getAllBookByUser(req, res) {
        try {
            const books = await bookByUserService.getAllBookByUser();
            res.json(books);
        } catch (e) {
            console.error(`Error fetching books:`, e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Fetches a specific book by its ID associated with a user.
     * Responds with the book details if found, otherwise 404 if not found.
     */
    async getBookByUserById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const book = await bookByUserService.getbookByUserById(id);
            if (!book) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json(book);
        } catch (e) {
            console.error('Error fetching book:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    /**
     * Gets the total count of books associated with users.
     * Responds with the count of total books.
     */
    async getTotalBooks(req, res) {
        try {
            const user_Id = req.params.user_Id;
            const books = await bookByUserService.getTotalBooks(user_Id);
            res.json(books);
        } catch (e) {
            console.error(`Error fetching books:`, e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Gets the total count of books marked as "read".
     * Responds with the count of read books.
     */
    async getTotalBooksRead(req, res) {

        try {
            const user_Id = req.params.user_Id;
            const books = await bookByUserService.getTotalBooksRead(user_Id);
            res.json(books);
        } catch (e) {
            console.error(`Error fetching books:`, e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }


    /**
     * Recommends books by the user's most-read author.
     * Responds with unread books by the most-read author for a user.
     */
    async getRecommendationByMostReadAuthor(req, res) {
        try {
            const user = req.params.user;
            const book = await bookByUserService.getRecommendationByMostReadAuthor(user);
            if (!book) {
                return res.status(404).json({ message: 'No recommendations found' });
            }
            res.json(book);
        } catch (e) {
            console.error('Error fetching recommendation:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Recommends books by the user's most-read genre.
     * Responds with unread books in the most-read genre for a user.
     */
    async getRecommendationByMostReadGenre(req, res) {
        try {
            const user = req.params.user;
            const book = await bookByUserService.getRecommendationByMostReadGenre(user);
            if (!book) {
                return res.status(404).json({ message: 'No recommendations found' });
            }
            res.json(book);
        } catch (e) {
            console.error('Error fetching recommendation:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Creates a book association for a user in the system.
     * Validates required fields and associates a book with a user.
     */
    async createBookByUser(req, res) {
        try {
            const { start_date, end_date, username, title, status, current } = req.body;

            if (!start_date || !end_date || !username || !title || !status) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const newBook = await bookByUserService.createBookByUser({ start_date, end_date, username, title, status, current });
            res.status(201).json(newBook);
        } catch (e) {
            console.error('Error creating book:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Updates a book association for a user.
     * Validates required fields and updates the association with new data.
     */
    async updateBookByUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const { start_date, end_date, username, title, status, current } = req.body;

            if (!start_date || !end_date || !title || !status || !current) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const success = await bookByUserService.updateBookByUser(id, {
                start_date
                , end_date, username, title, status, current
            });
            if (!success) {
                return res.status(404).json({ message: 'Book not found or no changes made' });
            }
            res.json({ message: 'Book updated successfully' });
        } catch (e) {
            console.error('Error updating book:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * Deletes a book association for a user.
     * Responds with success message if deletion is successful, 404 if not found.
     */
    async deleteBookByUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            const success = await bookByUserService.deleteBookByUser(id);
            if (!success) {
                return res.status(404).json({ message: 'Book not found' });
            }
            res.json({ message: 'Book deleted successfully' });
        } catch (e) {
            console.error('Error deleting book:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new BookByUserController();
