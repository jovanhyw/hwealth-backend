const express = require('express');
const router = express.Router();
const caloriesRecordService = require('../services/caloriesrecord.service');

router.post('/', caloriesRecordService.createCaloriesRecord);
router.get('/', caloriesRecordService.getAllCaloriesRecord);
router.put('/:id', caloriesRecordService.updateCaloriesRecord);
router.delete('/:id', caloriesRecordService.deleteCaloriesRecord);

module.exports = router;
