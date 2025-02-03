// Importing moment for any potential date manipulation if needed
const moment = require("moment");

// User class representing a user in the system
class User {
    /**
     * Constructor to initialize a User object.
     * @param {number} id - Unique ID of the user
     * @param {string} FName - First name of the user
     * @param {string} LName - Last name of the user
     * @param {string} email - Email address of the user
     * @param {string} address - Physical address of the user
     * @param {string} phoneNumber - Contact phone number of the user
     * @param {string} username - Username chosen by the user
     * @param {string} password - Password for the user's account
     * @param {number} profile_Id - ID of the associated profile for the user
     * @param {number} reading_goal - The reading goal set by the user
     */
    constructor(id, FName, LName, email, address, phoneNumber, username, password, profile_Id, reading_goal) {
        this.id = id;
        this.FName = FName;
        this.LName = LName;
        this.email = email;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.username = username;
        this.password = password;
        this.profile_Id = profile_Id;
        this.reading_goal = reading_goal;
    }

    /**
     * Static method to create a User instance from a database row.
     * Maps database fields to User class properties.
     * @param {object} row - The database row containing User data
     * @returns {User} - New User instance
     */
    static fromRow(row) {
        return new User(
            row.user_Id,         // Unique ID for the user from the database
            row.first_name,      // User's first name
            row.last_name,       // User's last name
            row.email,           // User's email address
            row.address,         // User's address
            row.phoneNumber,     // User's phone number
            row.username,        // Username chosen by the user
            row.password,        // User's hashed or encrypted password
            row.profile_Id,      // Profile ID associated with the user
            row.reading_goal     // The reading goal set by the user
        );
    }
}

// Exporting the User class to use in other modules
module.exports = User;
