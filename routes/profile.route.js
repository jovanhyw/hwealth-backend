const express = require('express');
const router = express.Router();
const profileService = require('../services/profile.service');

router.get('/:accountid', profileService.getProfile);
router.put('/:accountid/update-profile', profileService.updateProfile);

module.exports = router;
