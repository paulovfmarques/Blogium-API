function idIncrementor(repository) {
  return repository.map((r) => r.id).reduce((a, b) => Math.max(a, b), 0) + 1;
}

module.exports = idIncrementor;
