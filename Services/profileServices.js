// Importing the database initialization function and profile model
const { initDB } = require('../Config/database');
const Profile = require('../Models/profileModel');

class ProfileService {
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
     * Fetches all profiles, including the associated usernames, from the database.
     * Joins the profile table with the user table based on the profile ID.
     * @returns {Promise<Profile[]>} - Returns an array of Profile instances.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getAllProfiles() {
        try {
            const [rows] = await this.pool.query(`
                SELECT profile.profile_Id, username, bio, picture 
                FROM profile JOIN user ON profile.profile_Id = user.profile_Id
            `);
            return rows.map(Profile.fromRow); // Map each row to a Profile instance
        } catch (e) {
            throw new Error(`Error fetching all profiles: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches a specific profile by its ID, including the associated username.
     * Joins the profile table with the user table based on the profile ID.
     * @param {number} id - The ID of the profile.
     * @returns {Promise<Profile|null>} - Returns a Profile instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getProfileById(id) {
        try {
            const [rows] = await this.pool.query(`
                SELECT profile.profile_Id, username, bio, picture 
                FROM profile JOIN user ON profile.profile_Id = user.profile_Id 
                WHERE profile.profile_Id = ?
            `, [id]);
            if (rows.length === 0) return null; // Return null if profile is not found
            return Profile.fromRow(rows[0]); // Convert the row to a Profile instance
        } catch (e) {
            throw new Error(`Error fetching profile by ID: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Fetches a profile by the associated username.
     * Joins the profile table with the user table based on the profile ID.
     * @param {string} username - The username associated with the profile.
     * @returns {Promise<Profile|null>} - Returns a Profile instance or null if not found.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async getProfileByUsername(username) {
        try {
            const [rows] = await this.pool.query(`
                SELECT profile.profile_Id, username, bio, picture 
                FROM profile JOIN user ON profile.profile_Id = user.profile_Id 
                WHERE username = ?
            `, [username]);
            if (rows.length === 0) return null; // Return null if profile is not found
            return Profile.fromRow(rows[0]); // Convert the row to a Profile instance
        } catch (e) {
            throw new Error(`Error fetching profile by username: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Creates a new profile in the database.
     * @param {Object} profileData - The profile data, including bio and picture.
     * @returns {Promise<number>} - Returns the ID of the newly created profile.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async createProfile(profileData) {
        try {
            const { bio, picture } = profileData; // Destructure profile data with default empty values

            // Execute the insert query
            const [result] = await this.pool.query(
                `INSERT INTO profile (bio, picture) VALUES (?, ?)`,
                [bio, picture] // Set default values if bio or picture is undefined
            );

            return result.insertId; // Return the new profile ID

        } catch (e) {
            throw new Error(`Error creating profile: ${e.message}`); // Rethrow error with additional context
        }
    }

    /**
     * Updates an existing profile by its ID.
     * @param {number} profileId - The ID of the profile to update.
     * @param {Object} profileData - The updated profile data, including bio and picture.
     * @returns {Promise<boolean>} - Returns true if the update was successful, otherwise throws an error.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async updateProfile(profileId, profileData) {
        try {
            const { bio, picture } = profileData;

            // Convert picture to binary if it's a Base64 string
            const binaryPicture = picture ? Buffer.from(picture, 'base64') : null;


            const [result] = await this.pool.query(
                `UPDATE profile 
                 SET bio = COALESCE(?, bio), 
                     picture = COALESCE(?, picture) 
                 WHERE profile_Id = ?`,
                [bio, binaryPicture, profileId]
            );

            // Check if the profile was updated
            if (result.affectedRows === 0) {
                throw new Error(`Profile with ID ${profileId} not found or no changes made`);
            }

            return true; // Return success if profile is updated
        } catch (error) {
            throw new Error(`Error updating profile: ${error.message}`);
        }
    }


    /**
     * Deletes a profile by its ID.
     * @param {number} id - The ID of the profile to delete.
     * @returns {Promise<boolean>} - Returns true if the deletion was successful, otherwise false.
     * @throws {Error} - Throws an error if there is an issue with the database query.
     */
    async deleteProfile(id) {
        try {
            const [result] = await this.pool.query(
                `DELETE FROM profile WHERE profile_Id = ?`, [id]
            ); // Delete the profile by ID
            return result.affectedRows > 0; // Return true if the deletion was successful
        } catch (e) {
            throw new Error(`Error deleting profile: ${e.message}`); // Rethrow error with additional context
        }
    }
}

module.exports = new ProfileService(); // Export an instance of the ProfileService
