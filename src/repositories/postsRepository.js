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
  
  const result = await connection.query(queryString, newPost);
  newPost = result.rows[0];  

  return newPost;
}

async function updateById(id, postParams) {  
  let currentPost;
  
  const result = await connection.query('SELECT * FROM posts WHERE id=$1', [id]);
  currentPost = result.rows[0];  

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
  
  await connection.query(queryString, values);  

  return updatedPost;
}

async function destroyOneById(id) {  
  await connection.query('DELETE FROM posts WHERE "id"=$1', [id]);   
}

async function findAll(offset,limit) {
  let posts;
  let count;

  const result = await connection.query(`SELECT * FROM posts OFFSET ${offset} LIMIT ${limit}`);
  const countResult = await connection.query('SELECT COUNT(*) FROM posts');
  posts = result.rows;
  count = Number(countResult.rows[0].count);   

  return { posts, count };
}

async function findOneById(id) {
  let posts;
  
  const result = await connection.query('SELECT * FROM posts WHERE id=$1', [id]);
  posts = result.rows[0];  

  return posts;
}

async function findAllByAuthorId(authorId, offset, limit) {
  let posts;
  let count;

  const queryString = `SELECT * FROM posts
  WHERE "authorId"=$1 OFFSET ${offset} LIMIT ${limit}`;
  
  const result = await connection.query(queryString, [authorId]);
  const countResult = await connection.query('SELECT COUNT(*) FROM posts WHERE "authorId"=$1', [authorId]); 
  posts = result.rows;
  count = Number(countResult.rows[0].count);    

  return { posts, count };
}

async function postClap(userId, postId, claps) {

  claps = claps < 50 ? claps : 50;

  let currentClaps;

  const querySelect = `SELECT claps
  FROM claps WHERE "userId"=$1 AND "postId"=$2`;

  
  const result1 = await connection.query(querySelect,[userId,postId])    
  currentClaps = result1.rows.length !== 0 ? result1.rows[0].claps : 0;
    

  if(currentClaps >= claps) return false;

  const queryInsert = `INSERT INTO claps
  ("userId", "postId", claps)
  VALUES($1, $2, $3) RETURNING *`;

  const queryUpdate = `UPDATE claps
  SET claps = $3
  WHERE "userId"=$1 AND "postId"=$2 RETURNING *`;

  const queryString = currentClaps !== 0 ? queryUpdate : queryInsert;
  
  const result2 = await connection.query(queryString, [userId, postId, claps]);

  return result2.rows[0];
}

async function getTotalClaps(postId) {

  let totalClaps;

  const queryString = `
   SELECT COALESCE(SUM(claps), 0) AS total
   FROM claps
   WHERE "postId"=$1`;
  
  const { total }  = await connection.query(queryString,[postId]);
  totalClaps = total;  

  return Number(totalClaps);
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
