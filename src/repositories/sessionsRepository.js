const connection = require('../data');
const { v4: uuidv4 } = require("uuid");

async function createByUserId(userId) {
  let newSession = [
    userId,
    uuidv4()
  ];
  
  const queryString = `INSERT INTO sessions
  ("userId", token) VALUES($1, $2) RETURNING *`;
  
  const result = await connection.query(queryString, newSession)
  newSession = result.rows[0];

  return newSession;
}

async function findByToken(token) {  
  const result = await connection.query('SELECT * FROM sessions WHERE token=$1', [token]);

  if(result.rows.length === 0) return false;
  else return result.rows[0];    
}

async function destroyByUserId(userId) {  
  await connection.query('DELETE FROM sessions WHERE "userId"=$1', [userId]);   
}

module.exports = { createByUserId, findByToken, destroyByUserId };
