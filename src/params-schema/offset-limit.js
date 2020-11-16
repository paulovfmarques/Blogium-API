const Joi = require('joi');

module.exports = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(0).default(Infinity),
});
