import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createComment,
  createPost,
  deletePost,
  getFeedPosts,
  getPostById,
  likePost,
} from "../Controllers/post.controller.js";

const router = express.Router();

//get the all posts to home route
router.get("/", protectRoute, getFeedPosts);

//create a post route
router.post("/create", protectRoute, createPost);

//delete the post route
router.delete("/delete/:id", protectRoute, deletePost);

//get post by ID route
router.get("/:id", protectRoute, getPostById);

//create comment route
router.post("/:id/comment", protectRoute, createComment);

//like the post route
router.post("/:id/like", protectRoute, likePost);
export default router;
