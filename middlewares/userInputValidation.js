const Joi = require("joi");
const logger = require("../logger");

const validateUserCreation = async (req, res, next, error) => {
  try {
    const schema = Joi.object({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    await schema.validateAsync(req.body, {
      abortEarly: true,
      allowUnknown: true,
    });

    next(error);
  } catch (error) {
    logger.debug(error.message);
  }
};

const loginValidation = async (req, res, next, error) => {
  try {
    const schema = Joi.object({
      password: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    await schema.validateAsync(req.body, {
      abortEarly: true,
      allowUnknown: true,
    });

    next(error);
  } catch (error) {
    logger.error(error.message);
  }
};

const validBlogInput = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      body: Joi.string().required(),
      excerpt: Joi.string().required(),
      tag: Joi.array().items(Joi.string()).required(),
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

module.exports = { validateUserCreation, loginValidation, validBlogInput };
