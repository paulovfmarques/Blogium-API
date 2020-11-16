const express = require('express');
const { createByUserId } = require('./models/session');
const User = require('./models/user');
const UserParamsSchema = require('./params-schema/user');
const app = express();

app.use(express.json());

app.get('/health', (_req, res) => res.sendStatus(200));
app.post('/api/users/sign-up', (req, res) => {
  const userParams = req.body;
  const { value, error } = UserParamsSchema.validate(userParams);

  if (error) return res.status(400).json(error.details[0].message);
  if (!User.isEmailUnique(userParams.email)) return res.status(422).json({ error: 'Email is already in use' });

  const user = User.create(value);
  return res.status(200).json({
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    biography: user.biography,
    uuid: createByUserId(user.id).uuid,
  });
});

const port = 3000;
app.listen(port);
console.log(`Server is running on port ${port}`);
