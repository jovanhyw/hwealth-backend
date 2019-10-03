const StepsRecord = require('../models/StepsRecord');
const StepsRecordService = {};

StepsRecordService.createStepsRecord = async (req, res) => {
  // input validation

  const stepsRecord = new StepsRecord({
    accountId: req.account.accountid,
    ...req.body
  });

  try {
    await stepsRecord.save();

    res.status(201).send({
      error: false,
      message: 'Steps record created successfully.'
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to create steps record.'
    });
  }
};

StepsRecordService.getAllStepsRecord = async (req, res) => {
  try {
    const allRecords = await StepsRecord.find(
      { accountId: req.account.accountid },
      'dateRecorded totalSteps'
    ).sort({ dateRecorded: 'descending' });

    res.status(200).send({
      error: false,
      message: 'Steps records retrieved successfully.',
      records: allRecords
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to retrieve steps records.'
    });
  }
};

StepsRecordService.updateStepsRecord = async (req, res) => {
  // input validation

  try {
    const record = await StepsRecord.findById({ _id: req.params.id });

    if (req.account.accountid !== record.accountId.toString())
      return res.status(403).send({
        error: true,
        message: 'You are not authorized to make a change to this record.'
      });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to update steps record.'
    });
  }

  try {
    const updated = await StepsRecord.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        fields: '_id dateRecorded totalSteps'
      }
    );

    res.status(200).send({
      error: false,
      message: 'Steps record updated successfully.',
      record: updated
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to update steps record.'
    });
  }
};

StepsRecordService.deleteStepsRecord = async (req, res) => {
  // input validation

  try {
    const record = await StepsRecord.findById({ _id: req.params.id });

    if (req.account.accountid !== record.accountId.toString())
      return res.status(403).send({
        error: true,
        message: 'You are not authorized to delete this record.'
      });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid ID. Failed to delete steps record.'
    });
  }

  try {
    await StepsRecord.findByIdAndDelete({ _id: req.params.id });

    res.status(200).send({
      error: false,
      message: 'Steps record deleted successfully.'
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error. Failed to delete steps record.'
    });
  }
};

module.exports = StepsRecordService;
