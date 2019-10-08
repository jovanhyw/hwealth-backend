const Profile = require('../models/Profile');
const ProfileService = {};
const calcBMI = require('../utils/bmi');
const {
  updateProfileValidation,
  updateBMIValidation
} = require('../utils/validation');

ProfileService.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { accountId: req.account.accountid },
      '-_id -createdAt -updatedAt -__v -accountId'
    );

    res.status(200).send({
      error: false,
      message: 'Profile retrieved successfully.',
      profile
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

ProfileService.updateProfile = async (req, res) => {
  // input validation
  const { error } = updateProfileValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const profile = await Profile.findOne({ accountId: req.account.accountid });

    try {
      const updated = await Profile.findByIdAndUpdate(
        { _id: profile.id },
        req.body,
        {
          new: true,
          fields: '-_id -createdAt -updatedAt -__v -accountId'
        }
      );

      res.status(200).send({
        error: false,
        message: 'Profile updated successfully.',
        profile: updated
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to updated profile.'
      });
    }
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

ProfileService.calculateBMI = async (req, res) => {
  // input validation
  const { error } = updateBMIValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  const { weight, height } = req.body;

  const bmi = calcBMI(weight, height);

  try {
    const profile = await Profile.findOne({ accountId: req.account.accountid });

    try {
      const updated = await Profile.findByIdAndUpdate(
        { _id: profile.id },
        { weight, height, bmi },
        {
          new: true,
          fields: '-_id -createdAt -updatedAt -__v -accountId'
        }
      );

      res.status(200).send({
        error: false,
        message: 'BMI updated successfully.',
        profile: updated
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to updated profile.'
      });
    }
  } catch (err) {
    res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

module.exports = ProfileService;
