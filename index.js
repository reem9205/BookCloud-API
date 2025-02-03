// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const multer = require('multer'); // For handling multipart/form-data
const morgan = require('morgan'); // For logging HTTP requests (optional, for debugging)

// Import route modules
const userRoutes = require('./Routes/userRoutes');
const authorRoutes = require('./Routes/authorRoutes');
const genreRoutes = require('./Routes/genreRoutes');
const profileRoutes = require('./Routes/profileRoutes');
const bookRoutes = require('./Routes/bookRoutes');
const reviewRoutes = require('./Routes/reviewRoutes');
const bookByUserRoutes = require('./Routes/bookByUserRoutes');
const bookGenreRoutes = require('./Routes/bookGenreRoutes');
const imageRoute = require('./Routes/imageRoutes');
const bookshelfRoutes = require('./Routes/bookshelfRoutes');
const bookshelfBooksRoutes = require('./Routes/bookshelf_booksRoutes');
const imageServices = require('./Services/imageServices');

// Configure environment variables
dotenv.config();

// Initialize the Express application
const app = express();
app.set('view engine', 'ejs');

// Middleware for logging HTTP requests
app.use(morgan('dev')); // Logs requests to the console

// Middleware to parse JSON requests
app.use(express.json({ limit: '10mb' })); // Increase JSON payload limit to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase URL-encoded payload limit

// Multer setup for file uploads
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage });

// Middleware to serve static files from the 'Images' directory
app.use(express.static(path.join(__dirname, 'Images')));

// Set up session middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }, // Set to true if HTTPS is used
    })
);

// Middleware to set local variables for the user session
app.use((req, res, next) => {

    res.locals.user = req.session.user || null;
    next();
});

// Registering route handlers with file upload middleware for specific routes
app.use('/api/users', userRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/books', upload.single('image'), bookRoutes); // Handles file uploads for books
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookByUser', bookByUserRoutes);
app.use('/api/bookGenres', bookGenreRoutes);
app.use('/api/images', upload.single('image'), imageRoute); // Handles file uploads for images
app.use('/api/bookshelf', bookshelfRoutes);
app.use('/api/bookshelfBooks', bookshelfBooksRoutes);

// Homepage and Login Routes
app.get('/Homepage', async (req, res) => {
    try {
        // Fetch images using the service
        const images = await imageServices.getAllImages();


        // Render the homepage and pass the images to the template
        res.render('homepage', { error: null, images });
    } catch (err) {
        // Handle errors gracefully and log the error
        console.error(`Error in /Homepage: ${err.message}`);
        res.render('homepage', { error: 'Failed to load images', images: [] });
    }
});



// 404 Error Handling
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
