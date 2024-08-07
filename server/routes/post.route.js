import express from "express";
import { authorProtect, protect } from "../controllers/auth.controller.js";
import { createPost } from "../controllers/post.controller.js";
const router = express.Router();

router.post("/create", protect, authorProtect, createPost);

export default router;
