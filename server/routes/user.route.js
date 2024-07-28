import express from "express";
import { protect } from "../controllers/auth.controller.js";
import { updateUser } from "../controllers/user.controller.js";

const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "api is working!!" });
});

router.put("/update/:userId", protect, updateUser);

export default router;
