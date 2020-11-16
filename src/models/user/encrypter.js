const bcrypt = require('bcrypt');

function encrypt(str) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(str, salt);
}

function compare(str, hash) {
  return bcrypt.compareSync(str, hash);
}

module.exports = {
  encrypt,
  compare,
};
