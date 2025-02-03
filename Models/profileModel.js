// Importing moment for any potential date manipulation if needed
const moment = require("moment");

// Profile class representing a user's profile in the system
class Profile {
    /**
     * Constructor to initialize a Profile object.
     * @param {number} profile_Id - Unique ID of the profile
     * @param {Buffer|string} picture - Profile picture data, stored as binary or encoded string
     * @param {string} bio - Bio or description for the profile
     * @param {string} username - Username associated with the profile
     */
    constructor(profile_Id, picture, bio, username) {
        this.profile_Id = profile_Id;
        this.picture = picture;
        this.bio = bio;
        this.username = username;
    }

    /**
     * Static method to create a Profile instance from a database row.
     * @param {object} row - The database row containing Profile data
     * @returns {Profile} - New Profile instance
     */
    static fromRow(row) {
        return new Profile(
            row.profile_Id,   // Unique ID of the profile from the database
            row.picture,      // Profile picture data
            row.bio,          // Bio or description for the profile
            row.username      // Username associated with the profile
        );
    }
}

// Exporting the Profile class for use in other modules
module.exports = Profile;
