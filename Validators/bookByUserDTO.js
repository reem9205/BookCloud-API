
const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating or updating a BookByUser entry
const validateBookByUser = [
    // Validate that book_Id is a positive integer
    body('book_Id')
        .isInt({ min: 1 })
        .withMessage('Book ID must be a positive number')
        .optional(),

    // Validate that user_Id is a positive integer
    body('user_Id')
        .isInt({ min: 1 })
        .withMessage('User ID must be a positive number')
        .optional(),

    // Validate that status is a non-empty string
    body('status')
        .isString()
        .withMessage('Status must be a string')
        .notEmpty()
        .withMessage('Status is required'),

    // Validate that current_page is a positive integer
    body('current_page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Current page must be a positive number'),

    // Validate that start_date is an integer (consider changing to ISO8601 if it represents a date)
    body('start_date')
        .isInt()
        .withMessage('Start date must be an integer'),

    // Validate that end_date is an integer (consider changing to ISO8601 if it represents a date)
    body('end_date')
        .isInt()
        .withMessage('End date must be an integer'),

    // Middleware to check for validation errors and send a response if any are found
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for validating BookByUser ID
const validateBookByUserId = [
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
    validateBookByUser,
    validateBookByUserId
};
