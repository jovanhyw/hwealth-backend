const CaloriesRecord = require('../models/CaloriesRecord');
const CaloriesRecordService = {};

CaloriesRecordService.createCaloriesRecord = async (req, res) => {
  // input validation
  let totalCalories = 0;
  const { foodEaten } = req.body;

  foodEaten.forEach(food => {
    totalCalories = totalCalories + food.calories;
  });

  const caloriesRecord = new CaloriesRecord({
    accountId: req.account.accountid,
    ...req.body,
    totalCalories
  });

  try {
    await caloriesRecord.save();

    res.status(201).send({
      error: false,
      message: 'Calories record created successfully.'
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to create calories record.'
    });
  }
};

CaloriesRecordService.getAllCaloriesRecord = async (req, res) => {
  try {
    const allRecords = await CaloriesRecord.find(
      { accountId: req.account.accountid },
      '_id dateRecorded mealType foodEaten totalCalories'
    ).sort({ dateRecorded: 'descending' });

    res.status(200).send({
      error: false,
      message: 'Calories records retrieved successfully.',
      records: allRecords
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Failed to retrieve calories records.'
    });
  }
};

module.exports = CaloriesRecordService;
