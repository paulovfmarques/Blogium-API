const Joi = require('joi');

const get = Joi.object({
  offset: Joi.number().min(0).default(0),
  limit: Joi.number().min(0).default(Infinity),
});

const postSchema = Joi.object({
  title: Joi.string().min(10).max(30).required(),
  coverUrl: Joi.string().uri().required(),
  content: Joi.string().min(100).required(),
});

const create = postSchema;
const edit = postSchema;

module.exports = {
  get,
  create,
  edit
}
