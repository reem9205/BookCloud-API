// Importing the profile services to handle business logic for profiles
const profileServices = require('../Services/profileServices');

class ProfileController {

    /**
     * Fetch all profiles from the database.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getAllProfiles(req, res) {
        try {
            const profiles = await profileServices.getAllProfiles(); // Fetch all profiles from the service
            res.json(profiles); // Return the list of profiles as a JSON response
        } catch (e) {
            console.error('Error fetching profiles:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Send a generic error response
        }
    }

    /**
     * Fetch a specific profile by its ID.
     * @param {Object} req - The request object, containing the profile ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getProfileById(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the profile ID from the request parameters
            const profile = await profileServices.getProfileById(id); // Fetch the profile by ID from the service
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' }); // Return 404 if profile is not found
            }
            res.json(profile); // Return the found profile as JSON
        } catch (e) {
            console.error('Error fetching profile:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Fetch a profile by the associated username.
     * @param {Object} req - The request object, containing the username in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async getProfileByUsername(req, res) {
        try {
            const username = req.params.username; // Capture the username parameter from the request
            const profile = await profileServices.getProfileByUsername(username);
            // Fetch the profile by username from the service
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' }); // Return 404 if profile is not found
            }
            res.json(profile); // Return the found profile as JSON
        } catch (e) {
            console.error('Error fetching profile by username:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Create a new profile in the database.
     * Validates required fields before creation.
     * @param {Object} req - The request object, containing profile data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async createProfile(req, res) {
        try {
            const { bio, picture } = req.body; // Destructure profile data from the request body
            if (!bio) {
                return res.status(400).json({ message: 'Bio and Picture are required' });
                // Return 400 if required fields are missing
            }
            const newProfile = await profileServices.createProfile({ bio, picture }); // Call the service to create the profile
            res.status(201).json(newProfile); // Respond with the created profile and a 201 status
        } catch (e) {
            console.error('Error creating profile:', e); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Update an existing profile by its ID.
     * Validates required fields before updating.
     * @param {Object} req - The request object, containing the profile ID in the URL and updated data in the body.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async updateProfile(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the profile ID from the request parameters
            const { bio, picture } = req.body; // Destructure profile data from the request body
            if (!bio) {
                return res.status(400).json({ message: 'Bio and Picture are required' });
                // Return 400 if required fields are missing
            }
            const success = await profileServices.updateProfile(id, { bio, picture });
            // Call the service to update the profile
            if (!success) {
                return res.status(404).json({ message: 'Profile not found or no changes made' });
                // Return 404 if no update occurs
            }
            res.json({ message: 'Profile updated successfully' }); // Confirm successful update
        } catch (error) {
            console.error('Error updating profile:', error); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }

    /**
     * Delete a profile by its ID.
     * @param {Object} req - The request object, containing the profile ID in the URL.
     * @param {Object} res - The response object.
     * @returns {void}
     */
    async deleteProfile(req, res) {
        try {
            const id = parseInt(req.params.id, 10); // Parse the profile ID from the request parameters
            const success = await profileServices.deleteProfile(id); // Call deleteProfile in profileServices
            if (!success) {
                return res.status(404).json({ message: 'Profile not found' }); // Return 404 if profile is not found
            }
            res.json({ message: 'Profile deleted successfully' }); // Confirm successful deletion
        } catch (error) {
            console.error('Error deleting profile:', error); // Log the error
            res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
        }
    }
}

module.exports = new ProfileController(); // Export an instance of the ProfileController
