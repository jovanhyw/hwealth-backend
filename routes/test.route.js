const express = require('express');
const router = express.Router();
const testService = require('../services/test.service');

router.get('/', testService.hello);

module.exports = router;
