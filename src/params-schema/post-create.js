const Joi = require('joi');

module.exports = Joi.object({
  title: Joi.string().min(10).max(30).required(),
  coverUrl: Joi.string().uri().required(),
  content: Joi.string().min(100).required(),
});
