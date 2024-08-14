import express from "express";
import { authorProtect, protect } from "../controllers/auth.controller";
import { createPostByUser, getPost } from "../controllers/post.controller";
import { getCommentsByPost } from "../controllers/comment.controller";
const router = express.Router();

router.post("/", protect, authorProtect, createPostByUser);

router.get("/:path", getPost);
router.get("/:id/comments/", getCommentsByPost);

export default router;
