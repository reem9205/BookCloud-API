const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a Bookshelf entry
const validateBookshelf = [
    // Validate that user_Id is a positive integer
    body('user_Id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive number'),

    // Validate that bookshelf_name is a non-empty string
    body('bookshelf_name')
        .isString()
        .withMessage('Bookshelf name must be a string')
        .notEmpty()
        .withMessage('Bookshelf name is required'),

    // Validate that view is a non-empty string
    body('view')
        .isString()
        .withMessage('View must be a string')
        .notEmpty()
        .withMessage('View is required'),

    // Validate that start_date is an integer (consider changing to ISO8601 if it represents a date)
    body('start_date')
        .optional()
        .isInt()
        .withMessage('Start date must be an integer'),

    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating Bookshelf ID in route parameters
const validateBookshelfId = [
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
    validateBookshelf,
    validateBookshelfId
};
