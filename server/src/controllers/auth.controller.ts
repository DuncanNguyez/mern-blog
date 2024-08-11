import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import lodash from "lodash";
import { Request, Response, NextFunction } from "express";

import User, { IUser } from "../models/user.model";
import { errorHandler } from "../utils/error";
import { userValidation } from "../utils/validation";

const { find } = lodash;

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password, isAuthor } = req.body;
  try {
    const userP = { username, email, password } as IUser;
    const validated = await userValidation({ user: userP });
    const message = find(validated, (message) => message != false);
    if (message) {
      return res.status(400).json({ message });
    }
    const hashPassword = bcryptjs.hashSync(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashPassword,
      isAuthor,
    });
    const { password: pw, ...rest } = user._doc;
    return res.status(201).json(rest);
  } catch (error) {
    return next(error);
  }
};
const signin = async (req: Request, res: Response, next: NextFunction) => {
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
    const token = jwt.sign(
      { userId: user._id, isAuthor: user.isAuthor },
      process.env.JWT_SECRET as string
    );
    const { password: p, ...rest } = user;
    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(rest);
  } catch (error) {
    return next(error);
  }
};

const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { email, imageUrl } = req.body;
  const user = await User.findOne({ email }).lean();
  if (user) {
    const token = jwt.sign(
      { userId: user._id, isAuthor: user.isAuthor },
      process.env.JWT_SECRET as string
    );
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
  const token = jwt.sign(
    { userId: newUser._id, isAuthor: newUser.isAuthor },
    process.env.JWT_SECRET as string
  );
  const { password: pw, ...rest } = newUser._doc;

  return res
    .status(201)
    .cookie("access_token", token, { httpOnly: true })
    .json(rest);
};
const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorHandler(401, "Unauthorized"));
  }
  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: any, payload: any) => {
      if (err) {
        return next(errorHandler(401, "Unauthorized"));
      }
      (req as CusRequest).user = payload;
      return next();
    }
  );
};

const authorProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if ((req as CusRequest).user.isAuthor) {
    return next();
  }
  return next(errorHandler(403, "Access is not allowed"));
};

const signout = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res
      .status(200)
      .clearCookie("access_token")
      .json({ message: "User has been sign out" });
  } catch (error) {
    return next(error);
  }
};
export interface CusRequest extends Request {
  user: IUser;
}
export { signin, signup, googleAuth, protect, authorProtect, signout };
