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

function updateById(id, postParams) {
  const currentPost = findOneById(id);

  const updatedPost = {
    id,
    title: postParams.title || currentPost.title,
    coverUrl: postParams.coverUrl || currentPost.coverUrl,
    contentPreview: stringStripHtml(postParams.content || currentPost.content).result.substring(0, 300),
    content: postParams.content || currentPost.content,
    publishedAt: dayjs(),
    authorId: postParams.authorId,
  };

  const repository = loadSync(repositoryPath);
  for (let i = 0; i < repository.length; i++) {
    const post = repository[i];
    if (post.id === id) {
      post[i] = updatedPost;
      break;
    }
  }

  saveSync(repository, repositoryPath);
  return updatedPost;
}

function destroyOneById(id) {
  const repository = loadSync(repositoryPath).filter((p) => p.id != id);
  saveSync(repository, repositoryPath);
}

function findAll() {
  const repository = loadSync(repositoryPath);
  return repository;
}

function findOneById(id) {
  const repository = loadSync(repositoryPath);
  return repository.find((p) => p.id == id);
}

module.exports = { create, updateById, destroyOneById, findAll, findOneById };
