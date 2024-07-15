import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return next(errorHandler(400, "All fields are required!"));
  }
  try {
    const hashPassword = bcryptjs.hashSync(password, 10);
    await User.create({ username, email, password: hashPassword });
    return res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    return next(error);
  }
};
export const signin = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password || username === "" || password === "") {
    return next(errorHandler(400, "All fields are required!"));
  }

  try {
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return next(errorHandler(404, "User not found!"));
    }
    const validPw = bcryptjs.compareSync(password, user.password);
    if (!validPw) {
      return next(errorHandler(400, "Invalid password"));
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    const { password: p, ...rest } = user;
    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(rest);
  } catch (error) {
    return next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  const { displayName, email, imageUrl } = req.body;
  const user = await User.findOne({ email }).lean();
  if (user) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const { password, ...rest } = user;
    return res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(rest);
  }
  const password =
    Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  const hashPassword = bcryptjs.hashSync(password, 10);
  const newUser = await User.create({
    username: email.split("@")[0] + Math.random().toString(9).slice(-6),
    password: hashPassword,
    email,
    imageUrl,
  });
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
  const { password: pw, ...rest } = newUser._doc;

  return res
    .status(201)
    .cookie("access_token", token, { httpOnly: true })
    .json(rest);
};
