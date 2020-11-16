const jsonfile = require('jsonfile');
const idIncrementer = require('../../utils/id-incrementer');
const { encrypt, compare } = require('./encrypter');
const path = require('path');
const repositoryPath = path.resolve(__dirname, './repository.json');
const saveSync = require('../../utils/save-sync');
const loadSync = require('../../utils/load-sync');
const { use } = require('bcrypt/promises');

function create(userModel) {
  const repository = loadSync(repositoryPath);
  const newUser = {
    id: idIncrementer(repository),
    username: userModel.username,
    bio: userModel.bio,
    avatarUrl: userModel.avatarUrl,
    email: userModel.email,
    password: encrypt(userModel.password),
  };

  repository.push(newUser);
  saveSync(repository, repositoryPath);
  return newUser;
}

function findByEmailAndPassword(email, password) {
  const repository = loadSync(repositoryPath);
  return repository.find((user) => {
    return user.email === email && compare(password, user.password);
  });
}

function isEmailUnique(email) {
  const repository = loadSync(repositoryPath);
  return !repository.find((user) => user.email === email);
}

module.exports = { create, isEmailUnique, findByEmailAndPassword };
