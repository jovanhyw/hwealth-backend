const Account = require('../models/Account');
const Profile = require('../models/Profile');
const EmailToken = require('../models/EmailToken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AccountService = {};
const {
  registerValidation,
  updateEmailValidation,
  updatePasswordValidation
} = require('../utils/validation');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { sendEmailVerification } = require('../utils/sendEmailVerification');

AccountService.getAccount = async (req, res) => {
  try {
    const account = await Account.findById(
      { _id: ObjectId(req.account.accountid) },
      'username email -_id'
    );

    res.status(200).send({
      error: false,
      message: 'Account retrieved successfully.',
      account
    });
  } catch (err) {
    res.status(404).send({
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

      // create EmailToken for verification
      const emailToken = new EmailToken({
        accountId: createdAccount._id,
        token: crypto.randomBytes(16).toString('hex')
      });

      try {
        await emailToken.save();
        sendEmailVerification(
          createdAccount.email,
          createdAccount._id,
          emailToken.token
        );
      } catch (err) {
        res.status(500).send({
          error: true,
          message: 'Failed to create email verification token.'
        });
      }
    }

    res.status(201).send({
      error: false,
      message:
        'Account created successfully. Please follow the link sent to your email address verify your account.'
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
  const { error } = updateEmailValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  // check if email exists in db
  const emailExist = await Account.findOne({ email: req.body.email });
  if (emailExist)
    return res.status(400).send({
      error: true,
      message: 'Email already exists.'
    });

  try {
    const updated = await Account.findByIdAndUpdate(
      { _id: ObjectId(req.account.accountid) },
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
  const { error } = updatePasswordValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  if (req.body.newPassword !== req.body.confirmPassword)
    return res.status(400).send({
      error: true,
      message: "New passwords don't match."
    });

  let account = null;
  try {
    account = await Account.findById(ObjectId(req.account.accountid));
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
        message: `Old password don't match.`
      });

    // change pass
    const salt = await bcrypt.genSalt(12);
    const newHashedPw = await bcrypt.hash(req.body.newPassword, salt);

    try {
      await Account.findByIdAndUpdate(
        { _id: ObjectId(req.account.accountid) },
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

AccountService.verifyEmail = async (req, res) => {
  const emailTokenExist = await EmailToken.findOne({
    token: req.params.verificationToken
  });
  if (!emailTokenExist)
    return res.status(400).send({
      error: true,
      message: 'Unable to find valid token. Your token may have expired.',
      token: req.params.verificationToken
    });

  const account = await Account.findById({
    _id: ObjectId(emailTokenExist.accountId)
  });
  if (!account)
    return res.status(400).send({
      error: true,
      message: 'Unable to find an account for this token.'
    });
  if (account.verified)
    return res.status(400).send({
      error: true,
      message: 'This account has already been verified.'
    });

  try {
    account.verified = true;
    account.save();
    res.status(200).send({
      error: false,
      message: 'Email is verified!'
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Failed to verify email address.'
    });
  }
};

module.exports = AccountService;
