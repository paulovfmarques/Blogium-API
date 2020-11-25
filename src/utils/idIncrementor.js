function getNextId(list) {
  if(list.length === 0) return 1;
  return list[list.length-1].id + 1;
}

module.exports = getNextId;
