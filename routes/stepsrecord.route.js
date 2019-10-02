const express = require('express');
const router = express.Router();
const stepsRecordService = require('../services/stepsrecord.service');

router.post('/', stepsRecordService.createStepsRecord);
router.get('/', stepsRecordService.getAllStepsRecord);
router.put('/:id', stepsRecordService.updateStepsRecord);
router.delete('/:id', stepsRecordService.deleteStepsRecord);

module.exports = router;
