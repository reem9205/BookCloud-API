// Importing the review service to handle business logic for reviews
const reviewService = require('../Services/reviewServices');
const userServices = require('../Services/userServices');
class ReviewController {

    /**
     * Fetch all reviews from the database.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllReviews(req, res) {
        try {
            const reviews = await reviewService.getAllReviews(); // Fetch all reviews from the service
            res.json(reviews); // Return the list of reviews as a JSON response
        } catch (e) {
            console.error('Error fetching reviews:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch a specific review by its ID.
     * @param {Object} req - The request object, containing the review ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getReviewById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the review ID from the request parameters
            const review = await reviewService.getReviewById(id); // Fetch the review by ID from the service
            if (!review) {
                return res.status(404).json({ message: 'Review not found' }); // Return 404 if review is not found
            }
            res.json(review); // Return the found review as JSON
        } catch (e) {
            console.error('Error fetching review:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch a review by its associated book title.
     * @param {Object} req - The request object, containing the book title in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getReviewByTitle(req, res) {
        try {
            const title = req.params.title; // Capture the title parameter from the request
            const review = await reviewService.getReviewByTitle(title); // Fetch the review by title from the service
            if (!review) {
                return res.status(404).json({ message: 'Review not found' }); // Return 404 if review is not found
            }
            res.json(review); // Return the found review as JSON
        } catch (e) {
            console.error('Error fetching review by title:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch reviews by rating.
     * Validates the rating input to ensure it is between 1 and 5.
     * @param {Object} req - The request object, containing the rating in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getReviewByRate(req, res) {
        try {

            const rating = req.params.rating; // Log the incoming parameter


            // Validate that the rate is a valid number between 1 and 5
            if ((parseInt(rating) < 1 && parseInt(rating) > 5)) {
                return res.status(400).json({ message: 'Invalid rating. Rating must be a number between 1 and 5.' });
            }

            const reviews = await reviewService.getReviewByRate(parseInt(rating)); // Fetch reviews by rating
            if (!reviews) {
                return res.status(404).json({ message: 'Reviews not found' }); // Return 404 if no reviews are found
            }

            res.json(reviews); // Return the found reviews as JSON
        } catch (e) {
            console.error('Error fetching reviews by rating:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new review for a specified book.
     * Validates the required fields and ensures the rating is between 1 and 5.
     * @param {Object} req - The request object, containing review data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createReview(req, res) {
        try {
            const { title, review_des, rating } = req.body;

            // Validate required fields
            if (!title || !review_des || !rating) {
                return res.status(400).json({ message: 'Missing required fields' });
                // Return 400 if required fields are missing
            }


            // Call the service to create the review
            const newReview = await reviewService.createReview({ title, rating, review_des });

            // Respond with the created review
            res.redirect(`/api/bookByUser/currentBookView`);
        } catch (e) {
            console.error('Error creating review:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing review by its ID.
     * Validates the required fields and ensures the rating is between 1 and 5.
     * @param {Object} req - The request object, containing the review ID in the URL and updated data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateReview(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the review ID from the request parameters
            const { title, review_des, rating } = req.body;

            // Validate required fields
            if (!title || !review_des || !rating) {
                return res.status(400).json({ message: 'Missing required fields' }); // Return 400 if required fields are missing
            }

            // Validate that rate is a number between 1 and 5
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Invalid rating. Rating must be a number between 1 and 5.' });
            }

            // Call the service to update the review
            const updatedReview = await reviewService.updateReview(id, { title, review_des, rating });
            if (!updatedReview) {
                // Return 404 if review is not found
                return res.status(404).json({ message: 'Review not found or no changes made' });
            }
            res.json({ message: 'Review updated successfully' }); // Confirm successful update
        } catch (e) {
            console.error('Error updating review:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a review by its ID.
     * @param {Object} req - The request object, containing the review ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteReview(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the review ID from the request parameters
            const success = await reviewService.deleteReview(id); // Call deleteReview in reviewService
            if (!success) {
                return res.status(404).json({ message: 'Review not found' }); // Return 404 if review is not found
            }
            res.json({ message: 'Review deleted successfully' }); // Confirm successful deletion
        } catch (e) {
            console.error('Error deleting review:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
    * renders review view
    * @param {Object} req - The request object
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async reviewView(req, res) {
        const { title, rate } = req.query;

        try {
            let reviews = [];
            const userId = req.session?.user?.user_Id;

            if (!userId) {
                return res.status(401).send('Unauthorized: User not logged in.');
            }

            //gets needed data
            const data = await userServices.getBasicInfoForallViews(req.session.user.user_Id);

            // Filtering logic by given data
            if (title && rate) {
                const reviewsByTitle = await reviewService.getReviewByTitle(title);
                reviews = reviewsByTitle.filter(review => review.rating === parseInt(rate));
            } else if (title) {
                reviews = await reviewService.getReviewByTitle(title);
            } else if (rate) {
                reviews = await reviewService.getReviewByRate(rate);
            } else {
                reviews = await reviewService.getAllReviews();
            }

            res.render('reviews', { user: req.session.user, reviews, title, rate, data }); //render view
        } catch (error) {
            console.error('Error fetching reviews:', error);
            res.status(500).send('An error occurred while fetching reviews.');
        }
    }
}

module.exports = new ReviewController(); // Export an instance of the ReviewController
