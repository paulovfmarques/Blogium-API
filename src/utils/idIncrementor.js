const connection = require('../data');

async function getNextId() {
  try{
    const result = await connection.query('SELECT id FROM users ORDER BY id DESC LIMIT 1');

    if(result.rows.length === 0) return 1;
    else return (result.rows[0].id + 1);
    
  }catch(err){
    console.error(err.stack)
  }
}

module.exports = getNextId;
