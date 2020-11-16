const Joi = require('joi');

module.exports = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  avatarUrl: Joi.string().uri().required(),
  biography: Joi.string().min(8).max(118).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).max(30).required(),
  passwordConfirmation: Joi.ref('password'),
});
