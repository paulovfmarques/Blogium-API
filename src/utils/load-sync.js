const jsonfile = require('jsonfile');

function loadSync(repositoryPath) {
  try {
    return jsonfile.readFileSync(repositoryPath);
  } catch (err) {
    return [];
  }
}

module.exports = loadSync;
