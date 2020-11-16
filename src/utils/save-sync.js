const jsonfile = require('jsonfile');

function saveSync(repository, repositoryPath) {
  jsonfile.writeFileSync(repositoryPath, repository);
}

module.exports = saveSync;
