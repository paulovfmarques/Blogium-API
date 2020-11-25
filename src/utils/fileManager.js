const jsonfile = require('jsonfile');

function load(filePath) {
  try {
    return jsonfile.readFileSync(filePath);
  } catch (err) {
    return [];
  }
}

function save(filePath, data) {
  jsonfile.writeFileSync(filePath, data);
}

module.exports = {
    load,
    save
}