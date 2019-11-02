const Account = require('../models/Account');
const Profile = require('../models/Profile');
const EmailToken = require('../models/EmailToken');
const PasswordToken = require('../models/PasswordToken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const AccountService = {};
const {
  registerValidation,
  updateEmailValidation,
  updatePasswordValidation,
  resetPasswordValidation
} = require('../utils/validation');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const { sendEmailVerification } = require('../utils/sendEmailVerification');
const { sendPasswordResetEmail } = require('../utils/sendPasswordResetEmail');
const path = require('path');

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
      error: true,
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

  const { fullname, username, email } = req.body;

  // hash password
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const account = new Account({
    username,
    password: hashedPassword,
    email
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
        sendEmailVerification(createdAccount.email, emailToken.token);
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
        'Account created successfully. Please follow the link sent to your email address and verify your account.'
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
    token: req.query.token
  });
  if (!emailTokenExist)
    // return res.status(404).send({
    //   error: true,
    //   message: 'Unable to find valid token. Your token may have expired.'
    // });
    return res.sendFile(
      path.join(__dirname + '/views/email-token-expired.html')
    );

  const account = await Account.findById({
    _id: ObjectId(emailTokenExist.accountId)
  });
  if (!account)
    // return res.status(404).send({
    //   error: true,
    //   message: 'Unable to find an account for this token.'
    // });
    return res.sendFile(
      path.join(__dirname + '/views/email-account-not-found.html')
    );

  if (account.verified)
    // return res.status(400).send({
    //   error: true,
    //   message: 'This account has already been verified.'
    // });
    return res.sendFile(
      path.join(__dirname + '/views/email-account-alr-verified.html')
    );

  try {
    account.verified = true;
    account.save();
    res.sendFile(path.join(__dirname + '/views/email-verified.html'));
  } catch (err) {
    // res.status(500).send({
    //   error: true,
    //   message: 'Failed to verify email address.'
    // });
    res.sendFile(path.join(__dirname + '/views/email-failed.html'));
  }
};

AccountService.resendEmailToken = async (req, res) => {
  // do input validation
  const { error } = updateEmailValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const account = await Account.findOne(
      { email: req.body.email },
      '-password'
    );
    if (!account)
      return res.status(400).send({
        error: true,
        message: 'Email is not associated with any accounts.'
      });

    if (account.verified)
      return res.status(400).send({
        error: true,
        message:
          'The account associated with this email address has already been verified.'
      });

    // create EmailToken for verification
    const emailToken = new EmailToken({
      accountId: account._id,
      token: crypto.randomBytes(16).toString('hex')
    });

    try {
      await emailToken.save();
      sendEmailVerification(account.email, emailToken.token);

      res.status(200).send({
        error: false,
        message: 'A verification email has been sent to ' + account.email + '.'
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Failed to create email verification token.'
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

AccountService.forgotPassword = async (req, res) => {
  // do input validation
  const { error } = updateEmailValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  try {
    const account = await Account.findOne(
      { email: req.body.email },
      '-password'
    );
    if (!account)
      return res.status(400).send({
        error: true,
        message: 'Email is not associated with any accounts.'
      });

    // check if there is alr a token generated
    const tokenExist = await PasswordToken.findOne({ accountId: account._id });
    if (tokenExist) {
      return res.status(400).send({
        error: true,
        message:
          'A token has already been generated for this account. Please check your email or wait 1 hour before requesting for a new token.'
      });
    }

    const passwordToken = new PasswordToken({
      accountId: account._id,
      token: crypto.randomBytes(20).toString('hex')
    });

    try {
      await passwordToken.save();
      sendPasswordResetEmail(account.email, passwordToken.token);

      res.status(200).send({
        error: false,
        message:
          'A password reset link has been sent to ' +
          account.email +
          '. Please follow the instructions to reset your password'
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Failed to create password token.'
      });
    }
  } catch (err) {
    res.status(500).send({
      error: true,
      message: 'Internal Server Error.'
    });
  }
};

AccountService.resetPassword = async (req, res) => {
  // input validation for password
  const { error } = resetPasswordValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  const tokenExist = await PasswordToken.findOne({ token: req.query.token });
  if (!tokenExist)
    return res.status(404).send({
      error: true,
      message: 'Unable to find valid token. Your token may have expired.'
    });

  const account = await Account.findById({
    _id: ObjectId(tokenExist.accountId)
  });
  if (!account)
    return res.status(404).send({
      error: true,
      message: 'Unable to find an account for this token.'
    });

  try {
    const salt = await bcrypt.genSalt(12);
    const newHashedPw = await bcrypt.hash(req.body.newPassword, salt);

    try {
      await Account.findByIdAndUpdate(
        { _id: account._id },
        { password: newHashedPw },
        { new: true }
      );

      // delete the password token after the user reset the password
      // so that the magic link will not work after the reset is done
      try {
        await PasswordToken.findOneAndDelete({ _id: tokenExist._id });
      } catch (err) {
        res.status(500).send({
          error: true,
          message: 'Internal Server Error.'
        });
      }

      res.status(200).send({
        error: false,
        message: 'Password resetted successfully.'
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: 'Internal Server Error. Failed to reset password.'
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
