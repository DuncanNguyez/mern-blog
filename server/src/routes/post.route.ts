import express from "express";
import { authorProtect, protect } from "../controllers/auth.controller";
import {
  createPostByUser,
  downVotePost,
  getPost,
  upVotePost,
} from "../controllers/post.controller";
import { getCommentsByPost } from "../controllers/comment.controller";
const router = express.Router();

router.post("/", protect, authorProtect, createPostByUser);

router.post("/:id/vote", protect, upVotePost);
router.delete("/:id/vote", protect, downVotePost);

router.get("/:path", getPost);

router.get("/:id/comments/", getCommentsByPost);

export default router;
