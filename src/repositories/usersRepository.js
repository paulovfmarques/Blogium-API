const connection = require('../data');
const getNextId = require("../utils/idIncrementor");
const path = require("path");
const { save, load } = require("../utils/fileManager");

const usersFile = path.resolve("./src/data/users.json");

async function create(userParams) {
  const { username, biography, avatarUrl, email, password } = userParams;

  let id = await getNextId();

  let newUser = [
    id,
    username,
    biography,
    avatarUrl,
    email,
    password,
  ];

  const queryString = `INSERT INTO users
  (id, username, biography, "avatarUrl", email, password)
  VALUES($1, $2, $3, $4, $5, $6) RETURNING *
  `;

  try{
    const result = await connection.query(queryString, newUser)
    newUser = result.rows[0]
  }catch(err){
    console.log(err.stack)
  }

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

async function findByEmailAndPassword(email, password) {
  try{
    const result = await connection.query('SELECT * FROM users WHERE email=$1 AND password=$2', [email,password])    
    if(result.rows.length === 0) return false;
    else return result.rows[0];

  }catch(err){
    console.log(err.stack)
  }  
}

async function findById(id) {
  try{
    const result = await connection.query('SELECT * FROM users WHERE id=$1', [id])    
    if(result.rows.length === 0) return false;
    else return result.rows[0];

  }catch(err){
    console.log(err.stack)
  }  
}

async function isEmailUnique(email) {
  try{
    const result = await connection.query('SELECT * FROM users WHERE email=$1', [email])    
    if(result.rows.length !== 0) return false;
    else return true;

  }catch(err){
    console.log(err.stack)
  }  
}

module.exports = {
  create,
  isEmailUnique,
  findByEmailAndPassword,
  findById,
  updateById,
};
