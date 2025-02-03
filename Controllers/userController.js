// Importing the user service to handle business logic for users
const userService = require('../Services/userServices');

class UserController {

    /**
     * Fetch all users from the database.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers(); // Fetch all users from the service
            res.json(users); // Return the list of users as a JSON response
        } catch (e) {
            console.error('Error fetching users:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch all users along with their profile information.
     * Joins user data with profile data.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllUsersWithProfile(req, res) {
        try {
            const users = await userService.getAllUsersWithProfile(); // Fetch all users with profiles from the service
            res.json(users); // Return the list of users with profiles as a JSON response
        } catch (e) {
            console.error('Error fetching users with profile:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch a specific user by their ID.
     * @param {Object} req - The request object, containing the user ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the user ID from the request parameters
            const user = await userService.getUserById(id); // Fetch the user by ID from the service
            if (!user) {
                return res.status(404).json({ message: 'User not found' }); // Return 404 if user is not found
            }
            res.json(user); // Return the found user as JSON
        } catch (e) {
            console.error('Error fetching user by ID:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch a specific user by their username.
     * @param {Object} req - The request object, containing the username in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getUserByUsername(req, res) {
        try {
            const username = req.params.username; // Capture the username parameter from the request
            const user = await userService.getUserByUsername(username); // Fetch the user by username from the service
            if (!user) {
                return res.status(404).json({ message: 'User not found' }); // Return 404 if user is not found
            }
            res.json(user); // Return the found user as JSON
        } catch (e) {
            console.error('Error fetching user by username:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new user with associated profile.
     * @param {Object} req - The request object, containing user data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createUser(req, res) {
        try {
            const { FName, LName, username, email, password, phoneNumber, address, bio, reading_goal } = req.body;

            // Validate required fields
            if (!FName || !LName || !username || !email || !password) {
                // Return an error if required fields are missing
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Call createUser in userService to handle both user and profile creation
            const newUserWithProfile = await userService.createUser({
                FName, LName, username, email,
                password, phoneNumber, address, bio, reading_goal
            });

            // Respond with the created user
            res.status(201).json(newUserWithProfile);

        } catch (e) {
            console.error('Error creating user:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing user along with associated profile.
     * @param {Object} req - The request object, containing the user ID in the URL and updated data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the user ID from the request parameters
            const { FName, LName, address, email, phoneNumber, username, password, bio, reading_goal } = req.body;

            // Validate required fields for update
            if (!FName || !LName || !address || !email || !phoneNumber || !username || !password || !bio) {
                // Return 400 if required fields are missing
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Call updateUser in userService to handle the update
            const success = await userService.updateUser(id, {
                FName, LName, address, email, password,
                phoneNumber, username, bio, reading_goal
            });

            if (!success) {
                return res.status(404).json({ message: 'User not found or no changes made' }); // Return 404 if no update occurs
            }

            res.json({ message: 'User updated successfully' }); // Confirm successful update
        } catch (e) {
            console.error('Error updating user:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a user by their ID.
     * @param {Object} req - The request object, containing the user ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the user ID from the request parameters
            const success = await userService.deleteUser(id); // Call deleteUser in userService
            if (!success) {
                return res.status(404).json({ message: 'User not found' }); // Return 404 if user is not found
            }
            res.json({ message: 'User deleted successfully' }); // Confirm successful deletion
        } catch (e) {
            console.error('Error deleting user:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Sign in a user by validating credentials.
     * @param {Object} req - The request object, containing username and password in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async signIn(req, res) {
        try {
            const { username, password } = req.body;

            // Validate required fields for sign-in
            if (!username || !password) {
                // Return 400 if required fields are missing
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Call signIn in userService to validate credentials
            const success = await userService.signIn({ username, password });
            if (!success) {
                return res.status(404).json({ message: 'invalid username or  password to sign in' });
                // Return 404 if credentials are incorrect
            }
            res.json({ message: 'Signed in successfully' }); // Confirm successful sign-in
        } catch (e) {
            console.error('Error during sign-in:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }
}

module.exports = new UserController(); // Export an instance of the UserController
