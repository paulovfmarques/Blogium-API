const jsonfile = require('jsonfile');
const idIncrementer = require('../../utils/id-incrementer');
const { encrypt } = require('./encrypter');
const path = require('path');
const repositoryPath = path.resolve(__dirname, './repository.json');
const saveSync = require('../../utils/save-sync');
const loadSync = require('../../utils/load-sync');

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

function isEmailUnique(email) {
  const repository = loadSync(repositoryPath);
  return !repository.find((user) => user.email === email);
}

module.exports = { create, isEmailUnique };
