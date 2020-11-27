const userSchemas = require("../schemas/userSchemas");
const usersRepository = require("../repositories/usersRepository");
const sessionsRepository = require("../repositories/sessionsRepository");

async function postSignUp(req, res) {
  const userParams = req.body;

  const { error } = userSchemas.signUp.validate(userParams);
  if (error) return res.status(422).send({ error: error.details[0].message });
  
  try{

    const validEmail = await usersRepository.isEmailUnique(userParams.email);
    if (!validEmail) return res.status(409).json({ error: "Email is already in use" });
    
  }catch(e){
    return res.status(400).send(e.stack);
  }
    
  try{

    const user = await usersRepository.create(userParams);
    const userData = getUserData(user);

    return res.status(201).send(userData);

  }catch(e){
    return res.status(400).send(e.stack);
  } 
}

async function postSignIn(req, res) {
  const userParams = req.body;

  const { error } = userSchemas.signIn.validate(userParams);
  if (error) return res.status(422).send({ error: error.details[0].message });

  try{

    const user = await usersRepository.findByEmailAndPassword(
      userParams.email,
      userParams.password
    );
    if (!user) return res.status(401).send({ error: "Wrong email or password" });

    const { token } = await sessionsRepository.createByUserId(user.id);
    const userData = getUserData(user);

    return res.send({ ...userData, token });

  }catch(e){
    return res.status(400).send(e.stack);
  }   
}

async function postSignOut(req, res) {
  try{
    await sessionsRepository.destroyByUserId(req.user.id);
    return res.sendStatus(200);

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

async function putUser(req, res) {
  const userParams = req.body;
  const { error } = userSchemas.edit.validate(userParams);

  if (error) return res.status(422).json({ error: error.details[0].message });

  try{
    const user = await usersRepository.updateById(req.user.id, userParams);
    const userData = getUserData(user);

    return res.send({ ...userData, token: req.session.token });

  }catch(e){
    return res.status(400).send(e.stack);
  }  
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
