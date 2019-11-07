const express = require('express');
const router = express.Router();
const profileService = require('../services/profile.service');

router.get('/', profileService.getProfile);
router.put('/update-profile', profileService.updateProfile);
router.put('/update-bmi', profileService.calculateBMI);
router.get('/professionals', profileService.getPro);

// customer endpoint route
router.get('/getChatUsers', profileService.getChatUser);

module.exports = router;
