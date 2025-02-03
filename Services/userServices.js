// Importing database initialization function, user and profile models, and profile services
const { initDB } = require('../Config/database');
const User = require('../Models/userModel');
const Profile = require('../Models/profileModel');
const profileServices = require('./profileServices');

class userService {
    constructor() {
        this.pool = null; // Initialize the database connection pool as null
        this.init(); // Initialize the database connection pool
    }

    /**
     * Initializes the database connection pool.
     * This method is called automatically when an instance of the service is created.
     * @returns {Promise<void>} - Returns a promise once the database connection pool is set up.
     */
    async init() {
        this.pool = await initDB(); // Initialize the database connection pool
    }

    /**
     * Fetches all users from the database.
     * @returns {Promise<User[]>} - Returns an array of User instances.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllUsers() {
        try {
            const [rows] = await this.pool.query('SELECT * FROM user'); // Query to fetch all users
            return rows.map(User.fromRow); // Map each row to a User instance
        } catch (e) {
            throw new Error(`Error fetching users: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches all users with their profiles.
     * Joins the user table with the profile table based on the profile ID.
     * @returns {Promise<Object[]>} - Returns an array of user objects, each with associated profile data.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllUsersWithProfile() {
        try {
            const [rows] = await this.pool.query(`SELECT * FROM user JOIN profile ON user.profile_Id = profile.profile_Id`);
            return rows.map(row => ({
                ...User.fromRow(row), profile: Profile.fromRow(row) // Map each row to a User instance with profile data
            }));
        } catch (e) {
            // Rethrow error with additional context
            throw new Error(`Error fetching users with their profiles: ${e.message}`);
        }
    }

    /**
     * Fetches a user by their ID.
     * @param {number} id - The ID of the user.
     * @returns {Promise<User|null>} - Returns a User instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getUserById(id) {
        try {
            const [rows] = await this.pool.query(`SELECT * FROM user WHERE user_Id = ?`, [id]);
            if (rows.length === 0) return null; // Return null if user is not found
            return User.fromRow(rows[0]); // Convert the row to a User instance
        } catch (e) {
            throw new Error(`Error fetching user by ID: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches a user by their username.
     * @param {string} username - The username of the user.
     * @returns {Promise<User|null>} - Returns a User instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getUserByUsername(username) {
        try {
            const [rows] = await this.pool.query(`SELECT * FROM user WHERE username = ?`, [username]);
            if (rows.length === 0) return null; // Return null if user is not found
            return User.fromRow(rows[0]); // Convert the row to a User instance
        } catch (e) {
            throw new Error(`Error fetching user by username: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Creates a new user with associated profile.
     * First creates the profile, then inserts the user with the profile ID.
     * @param {Object} userData - The user data, including profile data.
     * @returns {Promise<User>} - Returns the newly created User instance.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createUser(userData) {
        try {
            const { FName, LName, username, email, password, phoneNumber, address, bio, reading_goal } = userData;

            // Check if username already exists
            const [check] = await this.pool.query(`SELECT username FROM user WHERE username = ?`, [username]);

            if (check.length > 0) {
                return 'username already exists';
            }

            // Step 1: Use profileServices to create the profile and get the profile ID
            const profileId = await profileServices.createProfile({ bio });

            // Insert user data with profileId as a foreign key
            const [result] = await this.pool.query(
                `INSERT INTO user (first_name, last_name, username, email, 
                password, phoneNumber, address, profile_Id, reading_goal)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [FName, LName, username, email, password, phoneNumber, address, profileId, reading_goal]
            );

            // Retrieve and return the new user with profile data
            return await this.getUserById(result.insertId);
        } catch (e) {
            throw new Error(`Error creating user: ${e.message}`);
        }
    }


    /**
     * Updates an existing user with associated profile.
     * Updates user data and profile data separately.
     * @param {number} id - The ID of the user to update.
     * @param {Object} userData - The updated user data, including profile data.
     * @returns {Promise<User>} - Returns the updated User instance.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async updateUser(id, userData) {
        try {
            const { FName, LName, username, email, password, phoneNumber, address, bio, reading_goal } = userData;

            const [check] = await this.pool.query(`SELECT username FROM user WHERE username = ?`,
                [username]
            );

            if (check.lenght > 0) {
                return 'username already exists';
            }
            // Update user data
            const [userResult] = await this.pool.query(
                `UPDATE user 
                 SET first_name = ?, last_name = ?, username = ?, email = ?, password = ?,
                  phoneNumber = ?, address = ?, reading_goal = ?
                 WHERE user_Id = ?`,
                [FName, LName, username, email, password, phoneNumber, address, reading_goal, id]
            );

            if (userResult.affectedRows === 0) {
                return (`User with ID ${id} not found or no changes made`); // Throw error if update fails
            }

            // Get the user's profile ID to update the profile
            const user = await this.getUserById(id);
            const profileId = user.profile_Id;

            //  Update profile data using profileServices
            const profileUpdated = await profileServices.updateProfile(profileId, { bio });

            if (!profileUpdated) {
                return (`Failed to update profile for user with ID ${id}`); // Throw error if profile update fails
            }

            //  Retrieve and return the updated user with profile data
            return await this.getUserById(id);

        } catch (e) {
            throw new Error(`Error updating user: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Deletes a user by their ID.
     * @param {number} id - The ID of the user to delete.
     * @returns {Promise<boolean>} - Returns true if the deletion was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async deleteUser(id) {
        try {
            // Delete related records first
            await this.pool.query(`DELETE FROM booksbyuser WHERE user_Id = ?`, [id]);
            await this.pool.query(`DELETE FROM bookshelf WHERE user_Id = ?`, [id]);


            // Delete the user by ID
            const [result] = await this.pool.query(`DELETE FROM user WHERE user_Id = ?`, [id]);

            return result.affectedRows > 0; // Return true if the deletion was successful
        } catch (e) {
            throw new Error(`Error deleting user and related records: ${e.message}`); // Rethrow error with additional context
        }
    }


    /**
     * Validates user sign-in credentials.
     * @param {Object} signIn - The sign-in data, including username and password.
     * @returns {Promise<boolean|string>} - Returns true if credentials are correct,
     *  "invalid username" if not found, or false if the password is incorrect.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async signIn(signIn) {
        try {
            const { username, password } = signIn;
            const [rows] = await this.pool.query(`SELECT password FROM user WHERE username = ?`, [username]);

            // Check if the username was found
            if (rows.length === 0) {
                return false; // Username not found, return false
            }

            const correctPass = rows[0].password;

            // Check if the password matches
            return correctPass === password; // Return true if the password matches, otherwise false

        } catch (e) {
            throw new Error(`Error validating username and password: ${e.message}`); // Rethrow error with additional context
        }
    }

}

module.exports = new userService(); // Export an instance of the userService
