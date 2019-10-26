const Joi = require('@hapi/joi');

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
      .pattern(/^\S*$/)
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

const updateProfileValidation = data => {
  const schema = Joi.object({
    fullname: Joi.string().required(),
    dateOfBirth: Joi.date()
  });

  return schema.validate(data);
};

const updateBMIValidation = data => {
  const schema = Joi.object({
    weight: Joi.number().required(),
    height: Joi.number().required()
  });

  return schema.validate(data);
};

const stepsValidation = data => {
  const schema = Joi.object({
    dateRecorded: Joi.date().required(),
    totalSteps: Joi.number().required()
  });

  return schema.validate(data);
};

const createCaloriesValidation = data => {
  const schema = Joi.object({
    dateRecorded: Joi.date().required(),
    mealType: Joi.string().required(),
    foodEaten: Joi.array().required()
  });

  return schema.validate(data);
};

const updateCaloriesValidation = data => {
  const schema = Joi.object({
    dateRecorded: Joi.date(),
    mealType: Joi.string(),
    foodEaten: Joi.array()
  });

  return schema.validate(data);
};

const resetPasswordValidation = data => {
  const schema = Joi.object({
    newPassword: Joi.string()
      .required()
      .pattern(/^\S*$/)
  });

  return schema.validate(data);
};

const twoFactorGenSecretValidation = data => {
  const schema = Joi.object({
    password: Joi.string()
      .required()
      .pattern(/^\S*$/)
  });

  return schema.validate(data);
};

const twoFactorAuthenticateValidation = data => {
  const schema = Joi.object({
    token: Joi.string().required()
  });

  return schema.validate(data);
};

const twoFactorEnableValidation = data => {
  const schema = Joi.object({
    secret: Joi.string().required(),
    token: Joi.string().required()
  });

  return schema.validate(data);
};

const twoFactorRecoverValidation = data => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string()
      .required()
      .pattern(/^\S*$/),
    recoveryCode: Joi.string().required()
  });

  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateEmailValidation = updateEmailValidation;
module.exports.updatePasswordValidation = updatePasswordValidation;
module.exports.updateProfileValidation = updateProfileValidation;
module.exports.updateBMIValidation = updateBMIValidation;
module.exports.stepsValidation = stepsValidation;
module.exports.createCaloriesValidation = createCaloriesValidation;
module.exports.updateCaloriesValidation = updateCaloriesValidation;
module.exports.resetPasswordValidation = resetPasswordValidation;
module.exports.twoFactorGenSecretValidation = twoFactorGenSecretValidation;
module.exports.twoFactorAuthenticateValidation = twoFactorAuthenticateValidation;
module.exports.twoFactorEnableValidation = twoFactorEnableValidation;
module.exports.twoFactorRecoverValidation = twoFactorRecoverValidation;
