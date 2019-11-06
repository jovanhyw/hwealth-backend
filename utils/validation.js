const Joi = require('@hapi/joi');

const registerValidation = data => {
  const schema = Joi.object({
    fullname: Joi.string()
      .required()
      .min(3)
      .max(80)
      .pattern(/^[a-zA-Z ,.'-]+$/)
      .messages({
        'string.pattern.base': `Invalid full name.`
      }),
    username: Joi.string()
      .required()
      .min(5)
      .max(30)
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .messages({
        'string.pattern.base': `Only alphanumeric and no white spaces allowed in username.`
      }),
    password: Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*<>])(?=.{8,64})(?=.\S*$)/
      )
      .messages({
        'string.pattern.base': `Password must contain 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character, a minimum of 8 characters in total, and no white spaces.`
      }),
    email: Joi.string()
      .required()
      .email()
      .pattern(/^\S*$/)
      .messages({
        'string.pattern.base': `No white spaces allowed in email.`
      })
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
      .messages({
        'string.pattern.base': `No white spaces allowed in email.`
      })
  });

  return schema.validate(data);
};

const updatePasswordValidation = data => {
  const schema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*<>])(?=.{8,64})(?=.\S*$)/
      )
      .messages({
        'string.pattern.base': `New Password must contain 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character, a minimum of 8 characters in total, and no white spaces.`
      }),
    confirmPassword: Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*<>])(?=.{8,64})(?=.\S*$)/
      )
      .messages({
        'string.pattern.base': `Confirm Password must contain 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character, a minimum of 8 characters in total, and no white spaces.`
      })
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
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*<>])(?=.{8,64})(?=.\S*$)/
      )
      .messages({
        'string.pattern.base': `New Password must contain 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character, a minimum of 8 characters in total, and no white spaces.`
      })
  });

  return schema.validate(data);
};

const twoFactorGenSecretValidation = data => {
  const schema = Joi.object({
    password: Joi.string().required()
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
    password: Joi.string().required(),
    recoveryCode: Joi.string().required()
  });

  return schema.validate(data);
};

const adminUpdateRoleValidation = data => {
  const roleEnum = ['User', 'Professional'];
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .pattern(/^\S*$/)
      .messages({
        'string.pattern.base': `No white spaces allowed in email.`
      }),
    role: Joi.string()
      .required()
      .valid(...roleEnum)
  });

  return schema.validate(data);
};

const adminUpdateLockValidation = data => {
  const typeEnum = [0, 1];
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .pattern(/^\S*$/)
      .messages({
        'string.pattern.base': `No white spaces allowed in email.`
      }),
    type: Joi.number()
      .required()
      .valid(...typeEnum),
    lockReason: Joi.string()
  });

  return schema.validate(data);
};

const messageValidation = data => {
  const schema = Joi.object({
    recipient: Joi.string().required(),
    message: Joi.string().required()
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
module.exports.adminUpdateRoleValidation = adminUpdateRoleValidation;
module.exports.adminUpdateLockValidation = adminUpdateLockValidation;
module.exports.messageValidation = messageValidation;
