const bcrypt = require('bcrypt');

function encrypt(str) {
  return bcrypt.hashSync(str, 12);
}

function compare(str, hash) {
  return bcrypt.compareSync(str, hash);
}

module.exports = {
  encrypt,
  compare,
};
