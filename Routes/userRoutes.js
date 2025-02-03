const express = require('express');
const userController = require('../Controllers/userController');
const { validateUser, validateUserId } = require('../Validators/userDTO');
const router = express.Router();

// Route to get all users
router.get('/', (req, res) => userController.getAllUsers(req, res));

// Route to get all users with their profile information
router.get('/profiles', (req, res) => userController.getAllUsersWithProfile(req, res));

// Route to get a specific user by ID
router.get('/id/:id', validateUserId, (req, res) => userController.getUserById(req, res));

// Route to get a specific user by username
router.get('/username/:username', (req, res) => userController.getUserByUsername(req, res));

// Route to create a new user
router.post('/', validateUser, (req, res) => userController.createUser(req, res));

// Route to update an existing user by ID
router.put('/:id', [validateUser, validateUserId], (req, res) => userController.updateUser(req, res));

// Route to delete a user by ID
router.delete('/:id', validateUserId, (req, res) => userController.deleteUser(req, res));

// Route for user sign-in
router.post('/Login', (req, res) => userController.signIn(req, res));

module.exports = router;
