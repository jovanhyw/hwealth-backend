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
    password: Joi.string().pattern(/^\S*$/),
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

module.exports.registerValidation = registerValidation;
