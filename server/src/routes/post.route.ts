import express from "express";
import { authorProtect, protect } from "../controllers/auth.controller";
import {
  createPostByUser,
  downVotePost,
  getHashtags,
  getPost,
  getPosts,
  getPostsByTag,
  search,
  upVotePost,
} from "../controllers/post.controller";
import { getCommentsByPost } from "../controllers/comment.controller";
const router = express.Router();

router.post("/", protect, authorProtect, createPostByUser);
router.get("/", getPosts);
router.get("/search", search);

router.post("/:id/vote", protect, upVotePost);
router.delete("/:id/vote", protect, downVotePost);

router.get("/tags/:tag", getPostsByTag);

router.get("/hashtags/", getHashtags);

router.get("/:id/comments/", getCommentsByPost);

router.get("/:path", getPost);


export default router;
