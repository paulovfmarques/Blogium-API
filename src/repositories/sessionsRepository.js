const connection = require('../data');
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { save, load } = require("../utils/fileManager");

const sessionsFile = path.resolve("./src/data/sessions.json");

async function createByUserId(userId) {
  
  let token = uuidv4();

  let newSession = [
    userId,
    token
  ];

  const queryString = `INSERT INTO sessions
  ("userId", token) VALUES($1, $2) RETURNING *`;

  try{
    const result = await connection.query(queryString, newSession)
    newSession = result.rows[0]
  }catch(err){
    console.log(err.stack)
  }

  return newSession;
}

async function findByToken(token) {
  try{
    const result = await connection.query('SELECT * FROM sessions WHERE token=$1', [token])    
    if(result.rows.length === 0) return false;
    else return true;

  }catch(err){
    console.log(err.stack)
  }    
}

async function destroyByUserId(userId) {
  try{
    await connection.query('DELETE FROM sessions WHERE "userId"=$1', [userId]);
  }catch(err){
    console.log(err.stack)
  }  
}

module.exports = { createByUserId, findByToken, destroyByUserId };
