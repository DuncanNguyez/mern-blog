import express from "express";
import { authorProtect, protect } from "../controllers/auth.controller.js";
import {
  createPost,
  getPost,
  getPostsByUser,
} from "../controllers/post.controller.js";
const router = express.Router();

router.post("/create", protect, authorProtect, createPost);
router.get("/:path", getPost);
router.get("/user/:id", protect, authorProtect, getPostsByUser);

export default router;
