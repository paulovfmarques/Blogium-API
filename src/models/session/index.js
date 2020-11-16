const path = require('path');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const idIncrementor = require('../../utils/id-incrementor');
const repositoryPath = path.resolve(__dirname, './repository.json');
const saveSync = require('../../utils/save-sync');
const loadSync = require('../../utils/load-sync');

function createByUserId(userId) {
  let repository = loadSync(repositoryPath);
  const newSession = {
    id: idIncrementor(repository),
    userId,
    token: uuidv4(),
    isActive: true,
    createdAt: dayjs(),
  };

  invalidateAllByUserId(userId);
  repository = loadSync(repositoryPath);
  repository.push(newSession);
  saveSync(repository, repositoryPath);
  return newSession;
}

function invalidateAllByUserId(userId) {
  const repository = loadSync(repositoryPath);
  for (let session of repository) {
    if (session.userId === userId) {
      session.isActive = false;
    }
  }

  saveSync(repository, repositoryPath);
}

function findActiveByToken(token) {
  const repository = loadSync(repositoryPath);
  return repository.find((session) => {
    return session.isActive && session.token === token;
  });
}

module.exports = { createByUserId, invalidateAllByUserId, findActiveByToken };
