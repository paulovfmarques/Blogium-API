const postSchemas = require("../schemas/postSchemas");
const usersRepository = require("../repositories/usersRepository");
const postsRepository = require("../repositories/postsRepository");

async function getPosts(req, res) {
  const { value, error } = postSchemas.get.validate(req.query);
  if (error) return res.status(422).json({ error: error.details[0].message });

  const { offset, limit } = value;
  
  try{

    const { posts, count }  = await postsRepository.findAll(offset,limit);
    const postsData = await Promise.all(posts.map((post) => getPostData(post)));

    return res.status(200).send({
      count,
      posts: postsData,
    });

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

async function getUserPosts(req, res) {
  const { userId } = req.params;

  const { value, error } = postSchemas.get.validate(req.query);
  if (error) return res.status(422).send({ error: error.details[0].message });

  const { offset, limit } = value;

  try{

    const { posts, count } = await postsRepository.findAllByAuthorId(userId, offset, limit);    
    const postsData = await Promise.all(posts.map((post) => getPostData(post)));

    res.send({
      count,
      posts: postsData,
    });

  }catch(e){
    return res.status(400).send(e.stack);
  }
  
}

async function getPost(req, res) {
  const { postId } = req.params;

  try{
    const post = await postsRepository.findOneById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const postData = await getPostData(post, true);

    return res.send(postData);

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

async function postPost(req, res) {
  const postParams = req.body;

  const { error } = postSchemas.create.validate(postParams);
  if (error) return res.status(422).send({ error: error.details[0].message });

  try{

    const newPost = await postsRepository.create({
      title: postParams.title,
      coverUrl: postParams.coverUrl,
      content: postParams.content,
      authorId: req.user.id,
    });
  
    const postData = await getPostData(newPost, true);
    res.status(201).send(postData);

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

async function putPost(req, res) {
  const { postId } = req.params;
  const postParams = req.body;

  const { error } = postSchemas.edit.validate(postParams);
  if (error) return res.status(422).send({ error: error.details[0].message });

  try{

    const post = await postsRepository.findOneById(postId);
    if (!post) return res.status(404).send({ error: "Post not found" });
    if (req.user.id != post.authorId) return res.sendStatus(401);

  }catch(e){
    return res.status(400).send(e.stack);
  }
  
  try{

    const updatedPost = postsRepository.updateById(postId, {
      title: postParams.title,
      coverUrl: postParams.coverUrl,
      content: postParams.content,
      authorId: req.user.id,
    });
  
    const postData = await getPostData(updatedPost, true);
    res.send(postData);

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

async function deletePost(req, res) {
  const { postId } = req.params;

  try{

    const post = await postsRepository.findOneById(postId);
    if (!post) return res.status(404).send({ error: "Post not found" });
    if (req.user.id != post.authorId) return res.sendStatus(401);

  }catch(e){
    return res.status(400).send(e.stack);
  }
  
  try{

    await postsRepository.destroyOneById(postId);
    return res.sendStatus(200);

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

async function postClaps(req, res) {
  const { claps } = req.body;
  const { postId } = req.params;
  const { id } = req.user  

  const { error } = postSchemas.clapSchema.validate(req.body);
  if (error) return res.status(422).send({ error: error.details[0].message });

  try{

    const clapData = await postsRepository.postClap(id,postId,claps);
    if(!clapData) return res.status(200).send("Claps sent are less than the current amount")
    
    return res.status(201).send(clapData);

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

async function getPostData(post, fullContent = false) {
  try{
    const authorInfo = await usersRepository.findById(post.authorId);
    const totalClaps = await postsRepository.getTotalClaps(post.id);

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
      claps: post.claps || [],
      totalClaps
    };
  
    if (fullContent) {
      postData.content = post.content;
    } else {
      postData.contentPreview = post.contentPreview;
    }  
  
    return postData;

  }catch(e){
    return res.status(400).send(e.stack);
  }  
}

module.exports = {
  getPosts,
  getUserPosts,
  getPost,
  postPost,
  putPost,
  deletePost,
  postClaps
};
