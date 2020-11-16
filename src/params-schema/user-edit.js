const Joi = require('joi');

module.exports = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  avatarUrl: Joi.string().uri(),
  biography: Joi.string().min(8).max(118),
});
