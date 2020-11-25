const path = require('path');
const dayjs = require('dayjs');
const getNextId = require('../utils/idIncrementor');
const stringStripHtml = require('string-strip-html');
const { load, save } = require('../utils/fileManager');

const postsFile = path.resolve('../data/posts.json');

function create(postParams) {
  const posts = load(postsFile);

  const newPost = {
    id: getNextId(posts),
    title: postParams.title,
    coverUrl: postParams.coverUrl,
    contentPreview: stringStripHtml(postParams.content).result.substring(0, 300),
    content: postParams.content,
    publishedAt: dayjs(),
    authorId: postParams.authorId,
  };

  posts.push(newPost);
  save(postsFile, posts);

  return newPost;
}

function updateById(id, postParams) {
  const posts = load(postsFile);
  const currentPost = posts.find(p => p.id === id);

  const updatedPost = {
    id,
    title: postParams.title || currentPost.title,
    coverUrl: postParams.coverUrl || currentPost.coverUrl,
    contentPreview: stringStripHtml(postParams.content || currentPost.content).result.substring(0, 300),
    content: postParams.content || currentPost.content,
    publishedAt: dayjs(),
    authorId: currentPost.authorId,
  };

  const oldPostIndex = posts.indexOf(currentPost);
  posts[oldPostIndex] = updatedPost;
  save(postsFile, posts);

  return updatedPost;
}

function destroyOneById(id) {
  const posts = load(postsFile).filter((p) => p.id != id);
  save(postsFile, posts);
}

function findAll() {
  const posts = load(postsFile);
  return posts;
}

function findOneById(id) {
  const posts = load(postsFile);
  return posts.find((p) => p.id == id);
}

function findAllByAuthorId(authorId) {
  const posts = load(postsFile);
  return posts.filter((p) => p.authorId == authorId);
}

module.exports = { create, updateById, destroyOneById, findAll, findOneById };
