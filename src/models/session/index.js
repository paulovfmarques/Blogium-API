const path = require('path');
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const idIncrementer = require('../../utils/id-incrementer');
const repositoryPath = path.resolve(__dirname, './repository.json');
const saveSync = require('../../utils/save-sync');
const loadSync = require('../../utils/load-sync');

function createByUserId(userId) {
  const repository = loadSync(repositoryPath);
  const newSession = {
    id: idIncrementer(repository),
    userId,
    uuid: uuidv4(),
    isActive: true,
    createdAt: dayjs(),
  };

  invalidateAllByUserId(userId);
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

function findActiveByUserId(userId) {
  const repository = loadSync(repositoryPath);
  return repository.find((session) => {
    return session.isActive && session.userId === userId;
  });
}

module.exports = { createByUserId, invalidateAllByUserId };
