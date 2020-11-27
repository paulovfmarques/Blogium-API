const connection = require('../data');
const bcrypt = require('bcrypt');
const saltRounds = 10;

async function create(userParams) {
  const { username, biography, avatarUrl, email, password } = userParams;  

  const hashPwd = await bcrypt.hash(password, saltRounds);

  let newUser = [    
    username,
    biography,
    avatarUrl,
    email,
    hashPwd,
  ];

  const queryString = `INSERT INTO users
  (username, biography, "avatarUrl", email, password)
  VALUES($1, $2, $3, $4, $5) RETURNING *`;
  
  const result = await connection.query(queryString, newUser)
  newUser = result.rows[0]; 

  return newUser;
}

async function updateById(id, userParams) {  
  let currentUser;

  const result = await connection.query(`SELECT * FROM users WHERE id=$1`,[id]);
  currentUser = result.rows[0];  

  const updatedUser = {
    id,
    username: userParams.username || currentUser.username,
    biography: userParams.biography || currentUser.biography,
    avatarUrl: userParams.avatarUrl || currentUser.avatarUrl,
    email: currentUser.email,
    password: currentUser.password,
  };

  const values = [updatedUser.username, updatedUser.biography, updatedUser.avatarUrl, id]

  const queryString = `UPDATE users
  SET (username, biography, "avatarUrl") = 
  ($1, $2, $3)
  WHERE id = $4`;
    
  await connection.query(queryString, values);  

  return updatedUser;
}

async function findByEmailAndPassword(email, password) {
  const result = await connection.query('SELECT * FROM users WHERE email=$1', [email]);
  const match = await bcrypt.compare(password, result.rows[0].password);

  if(match) return result.rows[0];    
  else return false;  
}

async function findById(id) {  
    const result = await connection.query('SELECT * FROM users WHERE id=$1', [id]);

    if(result.rows.length !== 0) return result.rows[0];
    else return false;   
}

async function isEmailUnique(email) {  
  const result = await connection.query('SELECT * FROM users WHERE email=$1', [email]);

  if(result.rows.length !== 0) return false;
  else return true;   
}

module.exports = {
  create,
  isEmailUnique,
  findByEmailAndPassword,
  findById,
  updateById,
};
