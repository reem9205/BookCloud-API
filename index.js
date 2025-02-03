// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');

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

// Configure environment variables
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// Registering route handlers for various API endpoints
app.use('/api/users', userRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookByUser', bookByUserRoutes);
app.use('/api/bookGenres', bookGenreRoutes);
app.use('/api/images', imageRoute);
app.use('/api/bookshelf', bookshelfRoutes);
app.use('/api/bookshelfBooks', bookshelfBooksRoutes);

// Root route handler for the base URL
app.get('/', (req, res) => {
    res.send('Welcome to user API');
});

// Middleware to handle 404 errors for undefined endpoints
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Middleware to handle unexpected server errors
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Setting up the server to listen on the defined PORT or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
