import express from "express";
import { authorProtect, protect } from "../controllers/auth.controller";
import {
  updateUser,
  deleteUser,
  getUser,
  bookmarkPost,
} from "../controllers/user.controller";
import { deleteCommentByUser } from "../controllers/comment.controller";
import {
  deletePostByUser,
  editPostByUser,
  getPostsBookmarksByUser,
  getPostsByUser,
} from "../controllers/post.controller";

const router = express.Router();

router.get("/:id", getUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

router.get("/:id/posts", getPostsByUser);
router.get("/:id/posts/bookmark", protect, getPostsBookmarksByUser);
router.delete("/:userId/posts/:id", protect, authorProtect, deletePostByUser);
router.put("/:userId/posts/:id", protect, authorProtect, editPostByUser);

router.delete("/:userId/comments/:id", protect, deleteCommentByUser);
router.post("/:userId/bookmark/:id", protect, bookmarkPost);
export default router;
