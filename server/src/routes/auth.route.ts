import express from "express";
import {
  googleAuth,
  protect,
  refreshToken,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller";

const router = express.Router();

router.get("/", protect, (req, res) => {
  return res.status(200).json({ message: "authenticated" });
});
router.post("/",refreshToken)
router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.post("/google", googleAuth);
router.post("/sign-out", signout);

export default router;
