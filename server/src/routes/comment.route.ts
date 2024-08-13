import express from "express";
import { protect } from "../controllers/auth.controller";
import {
  createCommentByUser,
  getCommentsByComment,
} from "../controllers/comment.controller";
const router = express.Router();

router.post("/", protect, createCommentByUser);

router.get("/:replyToId", getCommentsByComment);

export default router;
