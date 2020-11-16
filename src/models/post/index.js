const path = require('path');
const dayjs = require('dayjs');
const idIncrementor = require('../../utils/id-incrementor');
const repositoryPath = path.resolve(__dirname, './repository.json');
const stringStripHtml = require('string-strip-html');
const saveSync = require('../../utils/save-sync');
const loadSync = require('../../utils/load-sync');

function create(postParams) {
  const repository = loadSync(repositoryPath);

  const newPost = {
    id: idIncrementor(repository),
    title: postParams.title,
    coverUrl: postParams.coverUrl,
    contentPreview: stringStripHtml(postParams.content).result.substring(0, 300),
    content: postParams.content,
    publishedAt: dayjs(),
    authorId: postParams.authorId,
  };

  repository.push(newPost);
  saveSync(repository, repositoryPath);
  return newPost;
}

function findAll() {
  const repository = loadSync(repositoryPath);
  return repository;
}

module.exports = { create, findAll };
