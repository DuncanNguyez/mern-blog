import express from "express";
import { authorProtect, protect } from "../controllers/auth.controller.js";
import {
  createPostByUser,
  deletePostByUser,
  editPostByUser,
  getPost,
  getPostByUser,
  getPostsByUser,
} from "../controllers/post.controller.js";
const router = express.Router();

router.post("/create", protect, authorProtect, createPostByUser);

router.get("/user/:path", protect, authorProtect, getPostByUser);
router.get("/user", protect, authorProtect, getPostsByUser);
router.get("/:path", getPost);

router.put("/edit/:id", protect, authorProtect, editPostByUser);

router.delete("/user/:id", protect, authorProtect, deletePostByUser);

export default router;
