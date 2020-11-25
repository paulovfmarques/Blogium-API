const express = require("express");
const cors = require("cors");
const app = express();

const usersController = require("./controllers/usersController");
const postsController = require("./controllers/postsController");
const authMiddleware = require("./middlewares/authMiddleware");

app.use(cors());
app.use(express.json());

// User routes
app.post("/api/users/sign-up", usersController.postSignUp);
app.post("/api/users/sign-in", usersController.postSignIn);
app.post("/api/users/sign-out", authMiddleware, usersController.postSignOut);
app.put("/api/users/edit", authMiddleware, usersController.putUser);

// Post routes
app.get("/api/users/:userId/posts", postsController.getUserPosts);
app.get("/api/posts", postsController.getPosts);
app.get("/api/posts/:postId", postsController.getPost);
app.post("/api/posts", authMiddleware, postsController.postPost);
app.put("/api/posts/:postId", authMiddleware, postsController.putPost);
app.delete("/api/posts/:postId", authMiddleware, postsController.deletePost);

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
