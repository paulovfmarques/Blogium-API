const postSchemas = require("../schemas/postSchemas");
const usersRepository = require("../repositories/usersRepository");
const postsRepository = require("../repositories/postsRepository");

function getPosts(req, res) {
  const posts = postsRepository.findAll();

  const { value, error } = postSchemas.get.validate(req.query);
  if (error) return res.status(422).json({ error: error.details[0].message });

  const { offset, limit } = value;

  const paginatedPosts = posts.slice(offset, offset + limit);
  const postsData = paginatedPosts.map((post) => getPostData(post));

  res.send({
    count: posts.length,
    posts: postsData,
  });
}

function getUserPosts(req, res) {
  const { userId } = req.params;

  const posts = postsRepository.findAllByAuthorId(userId);

  const { value, error } = postSchemas.get.validate(req.query);
  if (error) return res.status(422).send({ error: error.details[0].message });

  const { offset, limit } = value;

  const paginatedPosts = posts.slice(offset, offset + limit);
  const postsData = paginatedPosts.map((post) => getPostData(post));

  res.send({
    count: posts.length,
    posts: postsData,
  });
}

function getPost(req, res) {
  const { postId } = req.params;

  const post = postsRepository.findOneById(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const postData = getPostData(post, true);

  return res.send(postData);
}

function postPost(req, res) {
  const postParams = req.body;

  const { error } = postSchemas.create.validate(postParams);
  if (error) return res.status(422).send({ error: error.details[0].message });

  const newPost = postsRepository.create({
    title: postParams.title,
    coverUrl: postParams.coverUrl,
    content: postParams.content,
    authorId: req.user.id,
  });

  const postData = getPostData(newPost, true);
  res.status(201).send(postData);
}

function putPost(req, res) {
  const { postId } = req.params;
  const postParams = req.body;

  const post = postsRepository.findOneById(postId);
  if (!post) return res.status(404).send({ error: "Post not found" });
  if (req.user.id != post.authorId) return res.sendStatus(401);

  const { error } = postSchemas.edit.validate(postParams);
  if (error) return res.status(422).send({ error: error.details[0].message });

  const updatedPost = postsRepository.updateById(postId, {
    title: postParams.title,
    coverUrl: postParams.coverUrl,
    content: postParams.content,
    authorId: req.user.id,
  });

  const postData = getPostData(updatedPost, true);
  res.send(postData);
}

function deletePost(req, res) {
  const { postId } = req.params;

  const post = postsRepository.findOneById(postId);
  if (!post) return res.status(404).send({ error: "Post not found" });

  if (req.user.id != post.authorId) return res.sendStatus(401);

  postsRepository.destroyOneById(postId);
  return res.sendStatus(200);
}

function getPostData(post, fullContent = false) {
  const authorInfo = usersRepository.findById(post.authorId);

  const author = {
    id: authorInfo.id,
    username: authorInfo.username,
    avatarUrl: authorInfo.avatarUrl,
    biography: authorInfo.biography,
  };

  const postData = {
    id: post.id,
    title: post.title,
    coverUrl: post.coverUrl,
    publishedAt: post.publishedAt,
    author,
  };

  if (fullContent) {
    postData.content = post.content;
  } else {
    postData.contentPreview = post.contentPreview;
  }

  return postData;
}

module.exports = {
  getPosts,
  getUserPosts,
  getPost,
  postPost,
  putPost,
  deletePost,
};
