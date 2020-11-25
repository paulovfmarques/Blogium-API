const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { save, load } = require('../utils/fileManager');

const sessionsFile = path.resolve('../data/sessions.json');

function createByUserId(userId) {
  const sessions = load(sessionsFile);

  const newSession = {
    userId,
    token: uuidv4(),
  };

  sessions.push(newSession);
  save(sessionsFile, sessions);

  return newSession;
}

function findByToken(token) {
  const sessions = load(sessionsFile);

  return sessions.find((session) => {
    return session.token === token;
  });
}

function destroyByUserId(userId) {
  let sessions = load(sessionsFile);

  sessions = sessions.filter(s => s.userId !== userId);
  save(sessionsFile, sessions);
}

module.exports = { createByUserId, findByToken, destroyByUserId };
