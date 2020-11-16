function idIncrementer(repository) {
  return repository.reduce((a, b) => Math.max(a, b), 0) + 1;
}

module.exports = idIncrementer;
