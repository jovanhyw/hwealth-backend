const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const AccountService = {};
const { registerValidation } = require('../utils/validation');

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

  // Todo, get fullname as input so that
  // the user can set a profile
  const { username, email, role } = req.body;

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

  try {
    await account.save();
    res.status(201).send({
      error: false,
      message: 'Account created.'
    });
  } catch (err) {
    res.status(400).send({
      error: true,
      message: err
    });
  }
};

module.exports = AccountService;
