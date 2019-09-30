const Account = require('../models/Account');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthService = {};

AuthService.login = async (req, res) => {
  // login input validation

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
      _id: account._id,
      username: account.username,
      token: token
    });
  } catch (err) {
    res.status(500).send({
      error: true,
      message: err.message
    });
  }
};

module.exports = AuthService;
