const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = {};
const { loginValidation } = require('../utils/validation');

AuthService.login = async (req, res) => {
  // login input validation
  const { error } = loginValidation(req.body);
  if (error)
    return res.status(400).send({
      error: true,
      message: error.details[0].message
    });

  // check if username exists in db
  const account = await Account.findOne({ username: req.body.username });
  if (!account)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  // check if password is correct
  const validPass = await bcrypt.compare(req.body.password, account.password);
  if (!validPass)
    return res.status(401).send({
      error: true,
      message: 'Authentication failed.'
    });

  // login validated, create and assign jwt
  try {
    const token = jwt.sign(
      { _id: account._id, username: account.username },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );
    res.status(200).send({
      error: false,
      username: account.username,
      token: token
    });
  } catch (err) {
    // todo: log the error
    res.status(500).send({
      error: true,
      message: 'Internal Server Error. Unable to create token.'
    });
  }
};

module.exports = AuthService;
