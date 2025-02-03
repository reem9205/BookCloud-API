const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a Book
const validateBook = [
    // Validate that image_Id is a positive integer
    body('image_Id')
        .isInt({ min: 1 })
        .withMessage('Image ID must be a positive number')
        .optional(),

    // Validate that author_Id is a positive integer
    body('author_Id')
        .isInt({ min: 1 })
        .withMessage('Author ID must be a positive number')
        .optional(),

    // Validate that ISBN is a non-empty string
    body('ISBN')
        .isString()
        .withMessage('ISBN must be a string')
        .notEmpty()
        .withMessage('ISBN is required'),

    // Validate that title is a non-empty string
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .notEmpty()
        .withMessage('Title is required'),

    // Validate that language is a non-empty string
    body('language')
        .isString()
        .withMessage('Language must be a string')
        .notEmpty()
        .withMessage('Language is required'),

    // Validate that description is a string (optional)
    body('description')
        .isString()
        .withMessage('Description must be a string'),

    // Validate that page_count is a positive integer
    body('page_count')
        .isInt({ min: 1 })
        .withMessage('Page count must be a positive number')
        .optional(),

    // Validate that date_published is an integer (consider changing to ISO8601 if it represents a date)
    body('date_published')
        .optional(),

    // Middleware to check for validation errors and send a response if errors are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating Book ID
const validateBookId = [
    // Validate that id parameter is an integer
    param('id').isInt().withMessage('ID must be an integer'),

    // Middleware to check for validation errors and send a response if errors are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateBook,
    validateBookId
};
