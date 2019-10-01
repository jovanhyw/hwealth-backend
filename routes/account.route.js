const express = require('express');
const router = express.Router();
const accountService = require('../services/account.service');
const verifyToken = require('../services/auth.service').verifyToken;

/**
 * Public Routes
 */
router.post('/register', accountService.register);

/**
 * Protected Routes
 */
router.get('/', verifyToken, accountService.getAccount);
router.put('/update-email', verifyToken, accountService.updateEmail);
router.put('/update-password', verifyToken, accountService.updatePassword);

module.exports = router;
