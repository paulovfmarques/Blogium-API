const getNextId = require("../utils/idIncrementor");
const path = require("path");
const { save, load } = require("../utils/fileManager");

const usersFile = path.resolve("./src/data/users.json");

function create(userParams) {
  const { username, biography, avatarUrl, email, password } = userParams;

  const users = load(usersFile);
  const newUser = {
    id: getNextId(users),
    username,
    biography,
    avatarUrl,
    email,
    password,
  };

  users.push(newUser);
  save(usersFile, users);

  return newUser;
}

function updateById(id, userParams) {
  const users = load(usersFile);
  const currentUser = users.find((u) => u.id === id);

  const updatedUser = {
    id,
    username: userParams.username || currentUser.username,
    biography: userParams.biography || currentUser.biography,
    avatarUrl: userParams.avatarUrl || currentUser.avatarUrl,
    email: currentUser.email,
    password: currentUser.password,
  };

  const oldUserIndex = users.indexOf(currentUser);
  users[oldUserIndex] = updatedUser;

  save(usersFile, users);
  return updatedUser;
}

function findByEmailAndPassword(email, password) {
  const users = load(usersFile);
  return users.find((user) => {
    return user.email === email && password === user.password;
  });
}

function findById(id) {
  const users = load(usersFile);
  return users.find((user) => user.id === id);
}

function isEmailUnique(email) {
  const users = load(usersFile);
  return !users.find((user) => user.email === email);
}

module.exports = {
  create,
  isEmailUnique,
  findByEmailAndPassword,
  findById,
  updateById,
};
