const express = require('express');
const router = express.Router();
const tfa = require('../services/tfa.service');

// require a common file to read the current user details

router.post('/setup', tfa.setup);
router.post('/add', tfa.addUser);
router.delete('/deleteTfa', tfa.deleteTfa);
router.post('/verify', tfa.verifyTfa);


// route here

module.exports = router;
