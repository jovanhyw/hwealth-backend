const Joi = require('@hapi/joi');
const roleEnum = ['User', 'Professional', 'Admin'];

// Todo: password regex for complexity
const registerValidation = data => {
  const schema = Joi.object({
    fullname: Joi.string().required(),
    username: Joi.string()
      .required()
      .min(5)
      .max(30)
      .pattern(/^\S*$/),
    password: Joi.string()
      .required()
      .pattern(/^\S*$/),
    email: Joi.string()
      .required()
      .email()
      .pattern(/^\S*$/),
    role: Joi.string()
      .required()
      .valid(...roleEnum)
  });

  return schema.validate(data);
};

const loginValidation = data => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

const updateEmailValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .pattern(/^\S*$/)
  });

  return schema.validate(data);
};

const updatePasswordValidation = data => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .pattern(/^\S*$/),
    newPassword: Joi.string()
      .required()
      .pattern(/^\S*$/),
    confirmPassword: Joi.string()
      .required()
      .pattern(/^\S*$/)
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateEmailValidation = updateEmailValidation;
module.exports.updatePasswordValidation = updatePasswordValidation;
