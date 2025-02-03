// Importing database initialization function, user and profile models, and profile services
const { initDB } = require('../Config/database');
const User = require('../Models/userModel');
const Profile = require('../Models/profileModel');
const profileServices = require('./profileServices');
const bookByUserServices = require('./bookByUserServices');

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
            const [rows] = await this.pool.query(`
                SELECT user.user_Id, user.username, profile.profile_Id, profile.bio, profile.picture
                FROM user
                JOIN profile ON user.profile_Id = profile.profile_Id
            `);


            return rows.map(row => {
                const picture = row.picture
                    ? `data:image/jpeg;base64,${Buffer.from(row.picture).toString('base64')}`
                    : null;

                return {
                    user_Id: row.user_Id,
                    username: row.username,
                    profile: {
                        profile_Id: row.profile_Id,
                        bio: row.bio,
                        picture: picture
                    }
                };
            });
        } catch (e) {
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
            const [rows] = await this.pool.query(
                `
                SELECT user.user_Id, user.username, profile.profile_Id, profile.bio, profile.picture
                FROM user
                JOIN profile ON user.profile_Id = profile.profile_Id
                WHERE user.username = ?
                `, [username]
            );

            if (rows.length === 0) {
                throw new Error(`User with username '${username}' not found`);
            }

            const row = rows[0];
            const picture = row.picture
                ? `data:image/jpeg;base64,${Buffer.from(row.picture).toString('base64')}`
                : null;

            return {
                user_Id: row.user_Id,
                username: row.username,
                profile: {
                    profile_Id: row.profile_Id,
                    bio: row.bio,
                    picture: picture
                }
            };
        } catch (e) {
            throw new Error(`Error fetching user by username: ${e.message}`);
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
            const { firstName, lastName, username, email, password, bio } = userData;


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
                password, profile_Id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [firstName, lastName, username, email, password, profileId,]
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
            // Fetch existing user data
            const existingUser = await this.getUserById(id);

            if (!existingUser) {
                throw new Error(`User with ID ${id} not found`);
            }

            // Merge existing data with new data
            const updatedData = {
                first_name: userData.first_name || existingUser.FName,
                last_name: userData.last_name || existingUser.LName,
                username: userData.username || existingUser.username,
                email: userData.email || existingUser.email,
                password: userData.password || existingUser.password,
                phoneNumber: userData.phoneNumber || existingUser.phoneNumber,
                address: userData.address || existingUser.address,
                bio: userData.bio || existingUser.bio, // Ensure bio is included
                readingGoal: userData.readingGoal || existingUser.reading_goal,
                picture: userData.picture || existingUser.picture
            };

            // Update user table
            const [userResult] = await this.pool.query(`
                UPDATE user 
                SET first_name = ?, last_name = ?, username = ?, email = ?, password = ?,
                    phoneNumber = ?, address = ?, reading_goal = ?
                WHERE user_Id = ?`,
                [
                    updatedData.first_name,
                    updatedData.last_name,
                    updatedData.username,
                    updatedData.email,
                    updatedData.password,
                    updatedData.phoneNumber,
                    updatedData.address,
                    updatedData.readingGoal,
                    id
                ]
            );

            if (userResult.affectedRows === 0) {
                throw new Error(`User with ID ${id} not found or no changes made`);
            }

            // Update profile table if bio or picture is provided
            if (updatedData.bio || updatedData.picture) {
                const profileId = existingUser.profile_Id;
                const profileUpdated = await profileServices.updateProfile(profileId, {
                    bio: updatedData.bio,
                    picture: updatedData.picture
                });

                if (!profileUpdated) {
                    throw new Error(`Failed to update profile for user with ID ${id}`);
                }
            }

            // Fetch the updated user data after the update
            const updatedUser = await this.getUserById(id);

            let base64Picture = null;
            if (updatedUser.picture) {
                base64Picture = `data:image/png;base64,${Buffer.from(updatedUser.picture).toString('base64')}`;
            }


            return {
                success: true,
                user: {
                    user_Id: updatedUser.user_Id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    profile_Id: updatedUser.profile_Id,
                    bio: userData.bio,
                    picture: base64Picture, // Base64-encoded picture or null
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phoneNumber: updatedUser.phoneNumber,
                    address: updatedUser.address,
                    reading_goal: updatedUser.reading_goal,
                    password: updatedUser.password // Consider omitting this in production for security reasons
                }
            };

        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
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



            // Query the database for the user and profile
            const [rows] = await this.pool.query(`
                SELECT user.*, profile.bio, profile.picture 
                FROM user 
                JOIN profile ON profile.profile_Id = user.profile_Id 
                WHERE username = ?
            `, [username]);


            // Check if the username exists
            if (rows.length === 0) {

                return { success: false, message: 'Invalid username' }; // Return error for missing user
            }

            const user = rows[0]; // Get the user object
            const correctPass = user.password; // Extract the stored password

            // Check if the password matches
            if (password === correctPass) {

                // Convert the picture (if exists) to Base64
                let base64Picture = null;
                if (user.picture) {
                    base64Picture = `data:image/png;base64,${Buffer.from(user.picture).toString('base64')}`;
                }



                // Construct the response object
                const userWithProfile = {
                    user_Id: user.user_Id,
                    username: user.username,
                    email: user.email,
                    profile_Id: user.profile_Id,
                    bio: user.bio,
                    picture: base64Picture, // Base64-encoded picture or null
                    first_name: user.first_name,
                    last_name: user.last_name,
                    phoneNumber: user.phoneNumber,
                    address: user.address,
                    reading_goal: user.reading_goal,
                    password: user.password // Consider omitting this in production for security reasons
                };


                return { success: true, user: userWithProfile }; // Return the user object on success
            }


            return { success: false, message: 'Incorrect password' }; // Return error for password mismatch
        } catch (e) {

            throw new Error(`Error validating username and password: ${e.message}`);
        }
    }

    /**
     * gets the information needed for most views
     * @param {Object}
     * @returns {Promise<boolean|string>} - return informaion
     *
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getBasicInfoForallViews(user_Id) {
        try {

            const nbOfBooks = await bookByUserServices.getTotalBooks(user_Id);
            const booksRead = await bookByUserServices.getTotalBooksRead(user_Id);


            const data = { nbOfBooks, booksRead };

            return data;
        } catch (e) {
            console.error('Error fetching total books:', e);
            throw new Error(`Error geting information: ${e.message}`);
        }


    }


}

module.exports = new userService(); // Export an instance of the userService
