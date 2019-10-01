const Account = require('../models/Account');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const AccountService = {};
const { registerValidation } = require('../utils/validation');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

AccountService.getAccount = async (req, res) => {
  try {
    const account = await Account.findById(
      { _id: ObjectId(req.params.id) },
      'username email -_id'
    );

    return res.status(200).send({
      error: false,
      message: 'Account retrieved successfully.',
      account
    });
  } catch (err) {
    return res.status(404).send({
      error: false,
      message: 'Account ID not found.'
    });
  }
};

AccountService.register = async (req, res) => {
  // validate inputs before creating the account
  const { error } = registerValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  // check db for existing
  const usernameExist = await Account.findOne({ username: req.body.username });
  if (usernameExist)
    return res.status(400).send({
      error: true,
      message: 'Username already exists.'
    });

  const emailExist = await Account.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).send({
      error: true,
      message: 'Email already exists.'
    });

  const { fullname, username, email, role } = req.body;

  // hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Todo: generate verificationToken, email/sms to user
  const account = new Account({
    username,
    password: hashedPassword,
    email,
    role
  });

  const profile = new Profile({
    fullname
  });

  try {
    const createdAccount = await account.save();

    // if the account is created, then we create the profile
    // for the user. add the account id as a ref to the profile
    if (createdAccount) {
      profile.accountId = createdAccount._id;
      try {
        await profile.save();
      } catch (err) {
        res.status(400).send({
          error: true,
          message: err.message
        });
      }
    }

    res.status(201).send({
      error: false,
      message: 'Account created successfully.'
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: err.message
    });
  }
};

AccountService.updateEmail = async (req, res) => {
  // do input validation
  // check if email exists in db
  const emailExist = await Account.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).send({
      error: true,
      message: 'Email already exists.'
    });

  try {
    const updated = await Account.findByIdAndUpdate(
      { _id: ObjectId(req.params.id) },
      { email: req.body.email },
      { new: true }
    );

    res.status(200).send({
      error: false,
      message: 'Email updated successfully.',
      email: updated.email
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: err.message
    });
  }
};

AccountService.updatePassword = async (req, res) => {
  // input validation

  let account = null;
  try {
    account = await Account.findById(ObjectId(req.params.id));
  } catch (err) {
    return res.status(400).send({
      error: true,
      message: 'Invalid Account ID.'
    });
  }

  try {
    // verify password before allowing change
    const validPassword = await bcrypt.compare(
      req.body.currentPassword,
      account.password
    );
    if (!validPassword)
      return res.status(401).send({
        error: true,
        message: 'Authentication failed.'
      });

    // change pass
    const salt = await bcrypt.genSalt(12);
    const newHashedPw = await bcrypt.hash(req.body.newPassword, salt);

    try {
      await Account.findByIdAndUpdate(
        { _id: ObjectId(req.params.id) },
        { password: newHashedPw },
        { new: true }
      );

      res.status(200).send({
        error: false,
        message: 'Password updated successfully.'
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to update password.'
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

module.exports = AccountService;
