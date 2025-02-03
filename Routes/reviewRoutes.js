const express = require('express');
const reviewController = require('../Controllers/reviewController');
const { validateReview, validateReviewId } = require('../Validators/reviewDTO');
const router = express.Router();


router.get('/reviewView', (req, res) => reviewController.reviewView(req, res));
// Route to get all reviews
router.get('/', (req, res) => reviewController.getAllReviews(req, res));

// Route to get a specific review by ID
router.get('/id/:id', validateReviewId, (req, res) => reviewController.getReviewById(req, res));

// Route to get reviews for a specific book title
router.get('/title/:title', (req, res) => reviewController.getReviewByTitle(req, res));

// Route to get reviews by rating
router.get('/rating/:rating', (req, res) => reviewController.getReviewByRate(req, res));

// Route to create a new review
router.post('/createReview', validateReview, (req, res) => reviewController.createReview(req, res));

// Route to update an existing review by ID
router.put('/:id', [validateReview, validateReviewId], (req, res) => reviewController.updateReview(req, res));

// Route to delete a review by ID
router.delete('/:id', validateReviewId, (req, res) => reviewController.deleteReview(req, res));

module.exports = router;
