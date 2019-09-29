const mongoose = require('mongoose');

// Todo: validation for white spaces

const AccountSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    match: [/^\S*$/, 'No spaces allowed in username.'], // regex to check for any whitespaces at all
    trim: true
  },
  password: {
    type: String,
    required: true,
    match: [/^\S*$/, 'No spaces allowed in password.']
    /**
     * Actually the password we get at this point
     * should be hashed, and salted. so no need to
     * check for minlength, whitespace...we should
     * check it when we receive the password before
     * passing over to bcrypt to hash
     */
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    match: [/^\S*$/, 'No spaces allowed in email.'],
    trim: true
  },
  verified: {
    type: Boolean,
    required: true,
    default: false
  },
  verificationToken: {
    type: String
  },
  role: {
    type: String,
    required: true,
    enum: ['User', 'Professional', 'Admin']
  },
  locked: {
    type: Boolean,
    require: true,
    default: false
  }
});

AccountSchema.set('timestamps', true);

const Account = mongoose.model('Account', AccountSchema);

module.exports = Account;
