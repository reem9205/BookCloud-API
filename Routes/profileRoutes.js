const express = require('express');
const profileController = require('../Controllers/profileController');
const { validateProfile, validateProfileId } = require('../Validators/profileDTO');
const router = express.Router();

// Route to get all profiles
router.get('/', (req, res) => profileController.getAllProfiles(req, res));

// Route to get a specific profile by ID
router.get('/:id', validateProfileId, (req, res) => profileController.getProfileById(req, res));

// Route to get a specific username profile
router.get('/username/:username', (req, res) => profileController.getProfileByUsername(req, res));

// Route to create a new profile
router.post('/', validateProfile, (req, res) => profileController.createProfile(req, res));

// Route to update an existing profile by ID
router.put('/:id', [validateProfile, validateProfileId], (req, res) => profileController.updateProfile(req, res));

// Route to delete a profile by ID
router.delete('/:id', validateProfileId, (req, res) => profileController.deleteProfile(req, res));

module.exports = router;
