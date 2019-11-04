const express = require('express');
const router = express.Router();
const adminService = require('../services/admin.service');

router.post('/search', adminService.searchForAccount);
router.post('/update-role', adminService.updateAccountRole);
router.post('/update-lock', adminService.updateAccountLock);

module.exports = router;
