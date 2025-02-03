const express = require('express');
const userController = require('../Controllers/userController');
const { validateUser, validateUserId } = require('../Validators/userDTO');
const router = express.Router();

// Route to get information view
router.post('/info/:Id', (req, res) => userController.forAdditionalInfoView(req, res));

// Route to get all users
router.get('/', (req, res) => userController.getAllUsers(req, res));

// Route to create a new user
router.get('/signUp', (req, res) => userController.signUpView(req, res));

// Route to logout
router.get('/logOut', (req, res) => userController.logOutView(req, res));

// Route to all users view
router.get('/discoverView/:username', (req, res) => userController.discoverPerson(req, res));

// Dashboard Route
router.get('/dashboard', (req, res) => userController.dashboardView(req, res));

// Route to all users view
router.get('/allUsersView', (req, res) => userController.allUsersView(req, res));

// Route to get all users with their profile information
router.get('/profiles', (req, res) => userController.getAllUsersWithProfile(req, res));

// Route to get a specific user by ID
router.get('/id/:id', validateUserId, (req, res) => userController.getUserById(req, res));

// Route to get a specific user by username
router.get('/username/:username', (req, res) => userController.getUserByUsername(req, res));

// Route to create a new user
router.post('/signup', (req, res) => userController.createUser(req, res));

// Route to update user
router.post('/update/:id', (req, res) => userController.updateUser(req, res));

// Route to edit user view
router.get('/editSettingsView/', (req, res) => userController.editSettings(req, res));

// Route to delete a user by ID
router.get('/deleteUser/:id', validateUserId, (req, res) => userController.deleteUser(req, res));

// Route for user sign-in
router.post('/login', (req, res) => userController.signIn(req, res));

module.exports = router;
