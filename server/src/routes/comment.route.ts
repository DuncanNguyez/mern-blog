import express from "express";
import { protect } from "../controllers/auth.controller";
import {
  createCommentByUser,
  downVoteComment,
  getCommentsByComment,
  upVoteComment,
} from "../controllers/comment.controller";
const router = express.Router();

router.post("/", protect, createCommentByUser);

router.post("/:id/vote", protect, upVoteComment);
router.delete("/:id/vote", protect, downVoteComment);

router.get("/:replyToId", getCommentsByComment);

export default router;
