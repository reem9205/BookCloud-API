const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a Review entry
const validateReview = [
    // Validate that book_Id is a positive integer
    body('book_Id')
        .isInt({ min: 1 })
        .optional()
        .withMessage('Book ID must be a positive number'),

    // Validate that review_des is a non-empty string
    body('review_des')
        .isString()
        .withMessage('Review must be a string')
        .notEmpty()
        .withMessage('Review is required'),

    // Validate that rating is an integer between 1 and 5
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be a number between 1 and 5')
        .notEmpty()
        .withMessage('Rating is required'),

    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating Review ID in route parameters
const validateReviewId = [
    // Validate that id parameter is an integer
    param('id').isInt().withMessage('ID must be an integer'),

    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateReview,
    validateReviewId
};
