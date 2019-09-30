const Account = require('../models/Account');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const AccountService = {};
const { registerValidation } = require('../utils/validation');
const mongoose = require('mongoose');

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
      message: 'Account created.'
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
  // const emailExist = await Account.findOne({ email: req.body.email });
  // if (emailExist)
  //   return res.status(400).send({
  //     error: true,
  //     message: 'Email already exists.'
  //   });
  // try {
  //   await Account.findByIdAndUpdate(
  //     new mongoose.Types.ObjectId(req.params),
  //     req.body.email
  //   );
  // } catch (err) {
  //   res.status(400).send({
  //     error: true,
  //     message: err.message
  //   });
  // }
};

module.exports = AccountService;
