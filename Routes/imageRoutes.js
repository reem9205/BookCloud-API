const express = require('express');
const multer = require('multer');
const imageController = require('../Controllers/imageController');
const router = express.Router();

// Configure Multer for handling file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// Route to create a new image (requires file upload for image_front and image_side)
router.post('/', upload.fields([
    { name: 'image_front', maxCount: 1 },
    { name: 'image_side', maxCount: 1 }
]), (req, res) => imageController.createImage(req, res));

// Route to delete an image by ID
router.delete('/:id', (req, res) => imageController.deleteImage(req, res));

module.exports = router;
