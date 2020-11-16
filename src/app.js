const express = require('express');
const cors = require('cors');

const Session = require('./models/session');
const User = require('./models/user');
const Post = require('./models/post');
const UserSignUpParamsSchema = require('./params-schema/user-sign-up');
const UserSignInParamsSchema = require('./params-schema/user-sign-in');
const UserEditParamsSchema = require('./params-schema/user-edit');
const PostCreateParamsSchema = require('./params-schema/post-create');
const OffsetLimitSchema = require('./params-schema/offset-limit');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.sendStatus(200));

app.post('/api/users/sign-up', (req, res) => {
  const userParams = req.body;
  const { value, error } = UserSignUpParamsSchema.validate(userParams);

  if (error) return res.status(400).json({ error: error.details[0].message });
  if (!User.isEmailUnique(userParams.email)) return res.status(422).json({ error: 'Email is already in use' });

  User.create(value);
  return res.sendStatus(201);
});

app.post('/api/users/sign-in', (req, res) => {
  const userParams = req.body;
  const { error } = UserSignInParamsSchema.validate(userParams);

  if (error) return res.status(400).json({ error: error.details[0].message });
  const user = User.findByEmailAndPassword(userParams.email, userParams.password);
  if (!user) return res.status(401).json({ error: 'Wrong email or password' });

  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    biography: user.biography,
    token: Session.createByUserId(user.id).token,
  });
});

app.use((req, res, next) => {
  const sessionToken = req.headers.authorization;
  if (!sessionToken) return res.status(401).json({ error: 'Token not found' });
  const uuid = sessionToken.replace('Bearer ', '');

  const session = Session.findActiveByToken(uuid);
  if (!session) return res.status(401).json({ error: 'Invalid token' });
  const user = User.findById(session.userId);
  if (!user) return res.status(401).json({ error: 'Invalid token' });

  req.user = {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    biography: user.biography,
    token: uuid,
  };

  return next();
});

app.post('/api/users/sign-out', (req, res) => {
  Session.invalidateAllByUserId(req.user.id);
  return res.sendStatus(200);
});

app.put('/api/users/edit', (req, res) => {
  const userParams = req.body;
  const { error } = UserEditParamsSchema.validate(userParams);

  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = User.updateById(req.user.id, userParams);
  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    biography: user.biography,
    token: req.headers.authorization,
  });
});

app.post('/api/posts', (req, res) => {
  const postParams = req.body;
  const { error } = PostCreateParamsSchema.validate(postParams);

  if (error) return res.status(400).json({ error: error.details[0].message });

  const newPost = Post.create({
    title: postParams.title,
    coverUrl: postParams.coverUrl,
    content: postParams.content,
    authorId: req.user.id,
  });

  res.status(201).json({
    id: newPost.id,
    title: newPost.title,
    coverUrl: newPost.coverUrl,
    content: newPost.content,
    publishedAt: newPost.publishedAt,
    author: {
      id: req.user.id,
      username: req.user.id,
      avatarUrl: req.user.avatarUrl,
      biography: req.user.biography,
    },
  });
});

app.get('/api/posts', (req, res) => {
  const posts = Post.findAll();
  const query = req.query;
  const { value: normalizedQuery, error } = OffsetLimitSchema.validate(query);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { offset, limit } = normalizedQuery;

  res.status(200).json({
    count: posts.length,
    posts: posts.slice(offset, offset + limit).map((p) => {
      const completeAuthorInfo = User.findById(p.authorId);
      const author = {
        id: completeAuthorInfo.id,
        username: completeAuthorInfo.username,
        avatarUrl: completeAuthorInfo.avatarUrl,
        biography: completeAuthorInfo.biography,
      };

      return {
        id: p.id,
        title: p.title,
        coverUrl: p.coverUrl,
        contentPreview: p.contentPreview,
        publishedAt: p.publishedAt,
        author,
      };
    }),
  });
});

app.get('/api/users/:userId/posts', (req, res) => {
  const { userId } = req.params;

  const posts = Post.findAll().filter((p) => p.authorId == userId);

  const query = req.query;
  const { value: normalizedQuery, error } = OffsetLimitSchema.validate(query);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { offset, limit } = normalizedQuery;

  res.status(200).json({
    count: posts.length,
    posts: posts.slice(offset, offset + limit).map((p) => {
      const completeAuthorInfo = User.findById(p.authorId);
      const author = {
        id: completeAuthorInfo.id,
        username: completeAuthorInfo.username,
        avatarUrl: completeAuthorInfo.avatarUrl,
        biography: completeAuthorInfo.biography,
      };

      return {
        id: p.id,
        title: p.title,
        coverUrl: p.coverUrl,
        contentPreview: p.contentPreview,
        publishedAt: p.publishedAt,
        author,
      };
    }),
  });
});

const port = 3000;
app.listen(port);
console.log(`Server is running on port ${port}`);
