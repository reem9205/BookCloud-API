const e = require('express');
const bookByUserService = require('../Services/bookByUserServices');
const userServices = require('../Services/userServices');

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
            const user = req.params.user_Id;
            const book = await bookByUserService.getRecommendationByMostReadAuthor(user);
            if (!book) {
                res.render('noRecommendations');
                //return res.status(404).json({ message: 'No recommendations found' });
            }
            res.render('users', data);
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
     * gets the book detials
     * Responds with a specific book information and renders the view
     */
    async getUserBookDetails(req, res) {
        try {
            const { user_Id, book_Id } = req.params; // Extract user_Id and book_Id from URL parameters

            if (!user_Id || !book_Id) {
                return res.status(400).json({ error: "Missing user_Id or book_Id in request." });
            }

            const book = await bookByUserService.getUserBookById(user_Id, book_Id); // Call the service method

            if (!book) {
                return res.status(404).json({ message: "Book not found for the given user." });
            }

            // Send the book details as the response
            res.status(200).json(book);
        } catch (error) {
            console.error(`Error fetching book details: ${error.message}`);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    /**
     * gets the book detials
     * Responds with a all books currently reading
     */
    async getBookReading(req, res) {
        try {
            const { user_Id } = req.params; // Extract user_Id and book_Id from URL parameters

            if (!user_Id) {
                return res.status(400).json({ error: "Missing user_Id or book_Id in request." });
            }

            const book = await bookByUserService.getBookReading(user_Id); // Call the service method

            if (!book) {
                return res.status(404).json({ message: "Book not found for the given user." });
            }

            // Send the book details as the response
            res.status(200).json(book);
        } catch (error) {
            console.error(`Error fetching book details: ${error.message}`);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }


    /**
     * Creates a book association for a user in the system.
     * Validates required fields and associates a book with a user.
     */
    async createBookByUser(req, res) {
        try {
            const { start_date, end_date, username, title, status, current } = req.body;

            if (!username || !title) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const newBook = await bookByUserService.createBookByUser({ start_date, end_date, username, title, status, current });

            res.redirect('/api/books/allBooksView');
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
            const { start_date, end_date, status, current_page } = req.body;

            if (!status || !current_page) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const success = await bookByUserService.updateBookByUser(id, {
                start_date
                , end_date, status, current_page
            });



            res.redirect(`/api/users/dashboard`);
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
            res.redirect('/api/bookByUser/myCollectionView');
        } catch (e) {
            console.error('Error deleting book:', e);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
     * gets list of books unread
     * Responds with books reommended and render view
     */
    async authorRecommendationView(req, res) {
        try {

            const user_Id = req.session.user?.user_Id;
            if (!user_Id) {
                return res.redirect('/Homepage');
            }


            const data = await userServices.getBasicInfoForallViews(user_Id);
            const authors = await bookByUserService.getRecommendationByMostReadAuthor(user_Id);
            const success = authors && authors.length > 0;

            res.render('authorRecomendation', { user: req.session.user, authors, data, success });
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            res.status(500).render('authorRecomendation', { error: 'Error loading recommendations' });
        }
    }

    /**
     * gets list of books unread
     * Responds with books reommended and render view
     */
    async genreRecommendationView(req, res) {
        try {

            const user_Id = req.session.user?.user_Id;
            if (!user_Id) {
                return res.redirect('/Homepage');
            }
            const data = await userServices.getBasicInfoForallViews(user_Id);
            const genres = await bookByUserService.getRecommendationByMostReadGenre(user_Id);
            const success = genres && genres.length > 0;

            res.render('genreRecomendation', { user: req.session.user, genres, data, success });
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            res.status(500).render('genreRecomendation', { error: 'Error loading recommendations' });
        }
    }

    /**
     * gets list of books added into readers collection
     * Responds with books and render view
     */
    async myCollection(req, res) {
        try {
            const user_Id = req.session.user?.user_Id;
            if (!user_Id) {
                return res.redirect('/Homepage');
            }
            const data = await userServices.getBasicInfoForallViews(user_Id);


            const books = await bookByUserService.getbookByUserById(user_Id);


            res.render('myCollection', { user: req.session.user, books, data });
        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).render('myCollection', { error: 'Error loading recommendations' });
        }
    }

    /**
     * gets boooks info
     * render view
     */
    async bookDetailsPersonal(req, res) {
        try {

            const user_Id = req.session.user?.user_Id;
            if (!user_Id) {
                return res.redirect('/Homepage');
            }
            const data = await userServices.getBasicInfoForallViews(user_Id);

            const book = await bookByUserService.getUserBookById(user_Id, req.params.book_Id);

            res.render('bookDetailsPersonal', { user: req.session.user, book, data });
        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).render('bookDetailsPersonal', { error: 'Error loading recommendations' });
        }
    }

    /**
    * gets boooks info
    * render view
    */
    async currentBookView(req, res) {
        try {
            const user_Id = req.session.user?.user_Id;
            if (!user_Id) {
                return res.redirect('/Homepage');
            }
            const data = await userServices.getBasicInfoForallViews(user_Id);

            let books = await bookByUserService.getBookReading(user_Id);
            if (!Array.isArray(books)) {
                books = [books]; // Wrap in an array if not already one
            }

            res.render('currentBook', { user: req.session.user, books, data });
        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).render('currentBook', { error: 'Error loading recommendations' });
        }
    }


    /**
    * updates info
    * render view
    */
    async editBook(req, res) {
        try {

            const user_Id = req.session.user?.user_Id;
            if (!user_Id) {
                return res.redirect('/Homepage');
            }
            const data = await userServices.getBasicInfoForallViews(user_Id);


            const book = await bookByUserService.getUserBookById(user_Id, req.params.book_id);

            res.render('editBook', { user: req.session.user, book, data });
        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).render('editBook', { error: 'Error loading recommendations' });
        }
    }
}

module.exports = new BookByUserController();
