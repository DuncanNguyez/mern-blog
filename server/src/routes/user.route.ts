import express from "express";
import { protect } from "../controllers/auth.controller";
import { updateUser, deleteUser, getUser } from "../controllers/user.controller";
import { deleteCommentByUser } from "../controllers/comment.controller";

const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "api is working!!" });
});

router.get("/:id",getUser)

router.put("/update/:userId", protect, updateUser);
router.delete("delete/:userId", protect, deleteUser);
router.delete("/comments/:id",protect,deleteCommentByUser)

export default router;
