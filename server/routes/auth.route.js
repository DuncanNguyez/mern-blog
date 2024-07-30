import express from "express";
import {
  googleAuth,
  signin,
  signout,
  signup,
} from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/sign-up", signup);
router.post("/sign-in", signin);
router.post("/google", googleAuth);
router.post("/sign-out", signout);

export default router;
