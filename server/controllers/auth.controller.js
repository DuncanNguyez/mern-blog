import bcryptjs from "bcryptjs";

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
