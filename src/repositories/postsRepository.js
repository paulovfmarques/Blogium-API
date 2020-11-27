const connection = require('../data');
const dayjs = require("dayjs");
const stringStripHtml = require("string-strip-html");
const { reset } = require('nodemon');

async function create(postParams) {

  let newPost = [    
    postParams.title,
    postParams.coverUrl,
    stringStripHtml(postParams.content).result.substring(0,300),
    stringStripHtml(postParams.content).result,
    dayjs().toString(),
    postParams.authorId,
  ];   

  const queryString = `INSERT INTO posts
  (title, "coverUrl", "contentPreview", content, "publishedAt", "authorId")
  VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;

  try{
    const result = await connection.query(queryString, newPost)
    newPost = result.rows[0] 
  }catch(err){
    console.log(err.stack)
  }

  return newPost;
}

async function updateById(id, postParams) {  
  let currentPost;

  try{
    const result = await connection.query('SELECT * FROM posts WHERE id=$1', [id])
    currentPost = result.rows[0]
  }catch(err){
    console.log(err.stack)
  }

  const updatedPost = {
    id,
    title: postParams.title || currentPost.title,
    coverUrl: postParams.coverUrl || currentPost.coverUrl,
    contentPreview: stringStripHtml(
      postParams.content || currentPost.content
    ).result.substring(0, 300),
    content: postParams.content || currentPost.content,
    publishedAt: dayjs(),
    authorId: currentPost.authorId,
  };

  const values = [
    updatedPost.title,
    updatedPost.coverUrl, 
    updatedPost.contentPreview,
    updatedPost.content,
    id]

  const queryString = `UPDATE posts
  SET (title, "coverUrl", "contentPreview", content) = 
  ($1, $2, $3, $4)
  WHERE id = $5`;  

  try{
    await connection.query(queryString, values);    
  }catch(err){
    console.log(err.stack)
  }

  return updatedPost;
}

async function destroyOneById(id) {
  try{
    await connection.query('DELETE FROM posts WHERE "id"=$1', [id]);
  }catch(err){
    console.log(err.stack)
  }  
}

async function findAll(offset,limit) {
  let posts;
  let count;

  try{
    const result = await connection.query(`SELECT * FROM posts OFFSET ${offset} LIMIT ${limit}`)
    const countResult = await connection.query('SELECT COUNT(*) FROM posts');    
    posts = result.rows;
    count = Number(countResult.rows[0].count);
  }catch(err){
    console.log(err.stack)
  }  

  return { posts, count };
}

async function findOneById(id) {
  let posts;

  try{
    const result = await connection.query('SELECT * FROM posts WHERE id=$1', [id])
    posts = result.rows[0]
  }catch(err){
    console.log(err.stack)
  }  

  return posts;
}

async function findAllByAuthorId(authorId, offset, limit) {
  let posts;
  let count;
  const queryString = `SELECT * FROM posts
  WHERE "authorId"=$1 OFFSET ${offset} LIMIT ${limit}`;

  try{
    const result = await connection.query(queryString, [authorId])
    const countResult = await connection.query('SELECT COUNT(*) FROM posts WHERE "authorId"=$1', [authorId]); 
    posts = result.rows;
    count = Number(countResult.rows[0].count);
  }catch(err){
    console.log(err.stack)
  }  

  return { posts, count };
}

async function postClap(userId, postId, claps) {

  claps = claps < 50 ? claps : 50;

  let currentClaps;

  const querySelect = `SELECT claps
  FROM claps WHERE "userId"=$1 AND "postId"=$2`;

  try{
    const result = await connection.query(querySelect,[userId,postId])    
    currentClaps = result.rows.length !== 0 ? result.rows[0].claps : 0;
  }catch(err){
    console.log(err.stack)
  }  

  if(currentClaps >= claps) return false;

  const queryInsert = `INSERT INTO claps
  ("userId", "postId", claps)
  VALUES($1, $2, $3) RETURNING *`;

  const queryUpdate = `UPDATE claps
  SET claps = $3
  WHERE "userId"=$1 AND "postId"=$2 RETURNING *`;

  const queryString = currentClaps !== 0 ? queryUpdate : queryInsert;

  try{
    const result = await connection.query(queryString, [userId, postId, claps])
    return result.rows[0]
  }catch(err){
    console.log(err.stack)
  }  
}

async function getTotalClaps(postId) {

  let totalClaps;

  const queryString = `
   SELECT COALESCE(SUM(claps), 0) AS total
   FROM claps
   WHERE "postId"=$1`;

  try{
    const { total }  = await connection.query(queryString,[postId])
    totalClaps = total;
  }catch(err){
    console.log(err.stack)
  }

  return Number(totalClaps)
}

module.exports = {
  create,
  updateById,
  destroyOneById,
  findAll,
  findOneById,
  findAllByAuthorId,
  postClap,
  getTotalClaps
};
