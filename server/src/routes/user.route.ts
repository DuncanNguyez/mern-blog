import express from "express";
import { protect } from "../controllers/auth.controller";
import { updateUser, deleteUser } from "../controllers/user.controller";

const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "api is working!!" });
});

router.put("/update/:userId", protect, updateUser);
router.delete("delete/:userId", protect, deleteUser);


export default router;
