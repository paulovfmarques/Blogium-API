const jsonfile = require('jsonfile');
const idIncrementer = require('../../utils/id-incrementer');
const { encrypt, compare } = require('./encrypter');
const path = require('path');
const repositoryPath = path.resolve(__dirname, './repository.json');
const saveSync = require('../../utils/save-sync');
const loadSync = require('../../utils/load-sync');

function create(userModel) {
  const repository = loadSync(repositoryPath);
  const newUser = {
    id: idIncrementer(repository),
    username: userModel.username,
    biography: userModel.biography,
    avatarUrl: userModel.avatarUrl,
    email: userModel.email,
    password: encrypt(userModel.password),
  };

  repository.push(newUser);
  saveSync(repository, repositoryPath);
  return newUser;
}

function updateById(id, userModel) {
  const currentUser = findById(id);

  const updatedUser = {
    id,
    username: userModel.username || currentUser.username,
    biography: userModel.biography || currentUser.biography,
    avatarUrl: userModel.avatarUrl || currentUser.avatarUrl,
    email: currentUser.email,
    password: currentUser.password,
  };

  const repository = loadSync(repositoryPath);
  for (let i = 0; i < repository.length; i++) {
    const user = repository[i];
    if (user.id === id) {
      repository[i] = updatedUser;
      break;
    }
  }

  saveSync(repository, repositoryPath);
  return updatedUser;
}

function findByEmailAndPassword(email, password) {
  const repository = loadSync(repositoryPath);
  return repository.find((user) => {
    return user.email === email && compare(password, user.password);
  });
}

function findById(id) {
  const repository = loadSync(repositoryPath);
  return repository.find((user) => user.id === id);
}

function isEmailUnique(email) {
  const repository = loadSync(repositoryPath);
  return !repository.find((user) => user.email === email);
}

module.exports = { create, isEmailUnique, findByEmailAndPassword, findById, updateById };
