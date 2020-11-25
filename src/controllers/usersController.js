const userSchemas = require("../schemas/userSchemas");
const usersRepository = require("../repositories/usersRepository");
const sessionsRepository = require("../repositories/sessionsRepository");

function postSignUp(req, res) {
  const userParams = req.body;

  const { error } = userSchemas.signUp.validate(userParams);
  if (error) return res.status(422).send({ error: error.details[0].message });

  if (!usersRepository.isEmailUnique(userParams.email)) {
    return res.status(409).json({ error: "Email is already in use" });
  }

  const user = usersRepository.create(userParams);
  const userData = getUserData(user);

  return res.status(201).send(userData);
}

function postSignIn(req, res) {
  const userParams = req.body;

  const { error } = userSchemas.signIn.validate(userParams);
  if (error) return res.status(422).send({ error: error.details[0].message });

  const user = usersRepository.findByEmailAndPassword(
    userParams.email,
    userParams.password
  );
  if (!user) return res.status(401).send({ error: "Wrong email or password" });

  const { token } = sessionsRepository.createByUserId(user.id);
  const userData = getUserData(user);

  return res.send({ ...userData, token });
}

function postSignOut(req, res) {
  sessionsRepository.destroyByUserId(req.user.id);
  return res.sendStatus(200);
}

function putUser(req, res) {
  const userParams = req.body;
  const { error } = userSchemas.edit.validate(userParams);

  if (error) return res.status(422).json({ error: error.details[0].message });

  const user = usersRepository.updateById(req.user.id, userParams);
  const userData = getUserData(user);

  return res.send({ ...userData, token: req.session.token });
}

function getUserData(user) {
  const { id, email, username, avatarUrl, biography } = user;

  return {
    id,
    email,
    username,
    avatarUrl,
    biography,
  };
}

module.exports = {
  postSignUp,
  postSignIn,
  postSignOut,
  putUser,
};
