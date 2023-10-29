const Joi = require("joi");

const validateUserCreation = async (req, res, next) => {
  try {
    const schema = Joi.object({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    await schema.validateAsync(req.body, {
      abortEarly: true,
      allowUnknown: true,
    });

    next();
  } catch (error) {
    console.log(error.message);
  }
};

const loginValidation = async (req, res, next) => {
  try {
    const schema = Joi.object({
      password: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    await schema.validateAsync(req.body, {
      abortEarly: true,
      allowUnknown: true,
    });

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { validateUserCreation, loginValidation };
