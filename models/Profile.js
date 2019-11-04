const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    trim: true
  },
  height: {
    type: Number,
    trim: true
  },
  weight: {
    type: Number,
    trim: true
  },
  bmi: {
    type: Number,
    trim: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  }
});

ProfileSchema.set('timestamps', true);

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;
