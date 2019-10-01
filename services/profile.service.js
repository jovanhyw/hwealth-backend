const Profile = require('../models/Profile');
const ProfileService = {};
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

ProfileService.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne(
      { accountId: req.params.accountid },
      '-_id -createdAt -updatedAt -__v -accountId'
    );

    return res.status(200).send({
      error: false,
      message: 'Profile retrieved successfully.',
      profile
    });
  } catch (err) {
    return res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

ProfileService.updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ accountId: req.params.accountid });

    try {
      const updated = await Profile.findByIdAndUpdate(
        { _id: profile.id },
        req.body,
        {
          new: true,
          fields: '-_id -createdAt -updatedAt -__v -accountId'
        }
      );

      return res.status(200).send({
        error: false,
        message: 'Profile updated successfully.',
        profile: updated
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to updated profile.'
      });
    }
  } catch (err) {
    return res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }
};

module.exports = ProfileService;
