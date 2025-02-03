// Importing the user service to handle business logic for users
const profileServices = require('../Services/profileServices');
const userService = require('../Services/userServices');
const bookByUserServices = require('../Services/bookByUserServices');
const bookshelfServices = require('../Services/bookshelfServices');

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
            const { firstName, lastName, username, email, password } = req.body;

            // Step 2: Create the user
            const newUser = await userService.createUser({
                firstName,
                lastName,
                username,
                email,
                password,
                bio: 'N/D'
            });

            if (!newUser) {
                // Handle invalid user creation
                return res.status(401).render('signup', {
                    error: newUser.message || 'Username already taken please input another one'
                });
            }

            // Redirect to additional info page upon successful user creation
            res.render('additionalInfo', { user_Id: newUser.id });
        } catch (e) {
            console.error('Error creating user:', e);

            // Handle unexpected errors
            res.status(500).render('signup', {
                error: 'An unexpected error occurred. Please try again later.'
            });
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
            const { first_name, last_name, address, email, phoneNumber, username, password, bio, readingGoal, picture } = req.body;


            // Call the updateUser service to handle the update
            const result = await userService.updateUser(id, {
                first_name, last_name, address, email, password,
                phoneNumber, username, bio, readingGoal, picture
            });

            if (!result.success) {
                return res.status(404).json({ message: 'User not found or no changes made' }); // Return 404 if no update occurs
            }

            // After successful update, update the session with the new user data
            const updatedUser = result.user;

            // Set session with the updated user information
            req.session.user = {
                user_Id: updatedUser.user_Id,
                username: updatedUser.username,
                email: updatedUser.email,
                profile_Id: updatedUser.profile_Id,
                bio: updatedUser.bio,
                picture: updatedUser.picture, // If picture is Base64 encoded
                first_name: updatedUser.first_name,  // Corrected this line
                last_name: updatedUser.last_name,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address,
                reading_goal: updatedUser.reading_goal,
                password: updatedUser.password
            };

            // Redirect to the editSettingsView
            return res.redirect(`/api/users/editSettingsView`);

        } catch (e) {
            console.error('Error updating user:', e);
            return res.status(500).json({ message: 'Internal server error' }); // Return a generic error response
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
            res.redirect(`/homepage`);
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

            // Validate that username and password are provided
            if (!username || !password) {
                return res.status(400).render('homepage', { error: 'Username and password are required' });
            }

            // Validate credentials with userService
            const result = await userService.signIn({ username, password });

            if (!result.success) {
                // Handle invalid credentials
                return res.status(401).render('homepage', { error: result.message });
            }

            req.session.user = result.user; // Store user in the session
            res.redirect(`/api/users/dashboard`);

        } catch (e) {
            console.error('Error during sign-in:', e);
            return res.status(500).render('homepage', { error: 'Internal server error' });
        }
    }

    /**
    * renders signup view
    * @param {Object} req - The request object
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async signUpView(req, res) {
        const error = req.query.error || null; // Default to null if no error
        res.render('signup', { error }); // Pass `error` to the template
    }

    /**
    * renders homepage
    * @param {Object} req - The request object
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async logOutView(req, res) {
        res.redirect(`/homepage`);
    }


    /**
    *renders additional info view
    * @param {Object} req - The request object
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async forAdditionalInfoView(req, res) {
        try {
            const userId = req.params.Id; // Get user ID from the URL
            const { phoneNumber, address, readingGoal, picture, bio } = req.body;



            // Call the service to update the user
            const updatedUser = await userService.updateUser(userId, {
                phoneNumber,
                address,
                readingGoal,
                picture,
                bio
            });

            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User updated successfully', user: updatedUser }); //render if succefull
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    /**
    * render dashboard view
    * @param {Object} req - The request object
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async dashboardView(req, res) {
        if (!req.session.user) {
            return res.redirect('/Homepage');
        }

        try {
            const data = await userService.getBasicInfoForallViews(req.session.user.user_Id);

            // Fetch bookshelf data
            const bookshelf = await bookshelfServices.getBookshelfByUsername(req.session.user.username);


            res.render('dashboard', { user: req.session.user, data, bookshelf }); //render view
        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Always pass `bookshelf` to avoid template rendering issues
            res.status(500).render('dashboard', { user: req.session.user, data: null, bookshelf: [], error: 'Error loading dashboard' });
        }
    }

    /**
    * render other profile view
    * @param {Object} req - The request object, user id
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async discoverPerson(req, res) {
        if (!req.session.user) {
            return res.redirect('/Homepage');
        }

        try {
            const data = await userService.getBasicInfoForallViews(req.session.user.user_Id);


            // Fetch bookshelf data
            const bookshelf = await bookshelfServices.getBookshelfByView(req.params.username);

            const profile = await userService.getUserByUsername(req.params.username);

            res.render('discoverPerson', { user: req.session.user, data, bookshelf, profile });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Always pass `bookshelf` to avoid template rendering issues
            res.status(500).render('dashboard', { user: req.session.user, data: null, bookshelf: [], error: 'Error loading dashboard' });
        }
    }

    /**
        * renders all users view
        * @param {Object} req - The request object
        * @param {Object} res - The response object.
        * @returns {void}
        */
    async allUsersView(req, res) {
        try {

            const user_Id = req.session.user.user_Id;

            if (!user_Id) {
                return res.redirect('/Homepage');
            }

            //gets important data
            const data = await userService.getBasicInfoForallViews(user_Id);
            const users = await userService.getAllUsersWithProfile();


            const success = users && users.length > 0;


            res.render('allUsers', { user: req.session.user, users, data, success }); //render view
        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).render('allUsers', { error: 'Error loading recommendations' });
        }
    }

    /**
    * settings view
    * @param {Object} req - The request object
    * @param {Object} res - The response object.
    * @returns {void}
    */
    async editSettings(req, res) {
        try {

            const user_Id = req.session.user?.user_Id;
            if (!user_Id) {
                return res.redirect('/Homepage');
            }

            res.render('editProfile', { user: req.session.user }); //render view
        } catch (error) {
            console.error('Error fetching books:', error);
            res.status(500).render('allUsers', { error: 'Error loading recommendations' });
        }
    }


}
module.exports = new UserController(); // Export an instance of the UserController
