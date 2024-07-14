import User from "../models/user.model";
import bcryptjs from "bcryptjs";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  ) {
    return res.status(400).json({ message: "All fields are required!!" });
  }
  try {
    const hashPassword = bcryptjs.hashSync(password, 10);
    await User.create({ username, email, password: hashPassword });
    return res.status(201).json({ message: "Signup successful!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
