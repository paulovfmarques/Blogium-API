const Joi = require('joi');

const signIn = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const signUp = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    avatarUrl: Joi.string().uri().required(),
    biography: Joi.string().min(8).max(118).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(3).max(30).required(),
    passwordConfirmation: Joi.ref('password'),
});
  
const edit = Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    avatarUrl: Joi.string().uri(),
    biography: Joi.string().min(8).max(118),
});

module.exports = {
    signIn,
    signUp,
    edit
}; 