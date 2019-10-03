const express = require('express');
const router = express.Router();
const profileService = require('../services/profile.service');

router.get('/', profileService.getProfile);
router.put('/update-profile', profileService.updateProfile);
router.put('/update-bmi', profileService.calculateBMI);

module.exports = router;
