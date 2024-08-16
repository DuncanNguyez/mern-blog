import { NextFunction, Response, Request } from "express";
import lodash from "lodash";
import bcryptjs from "bcryptjs";

import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import { userValidation } from "../utils/validation";
import { CusRequest } from "./auth.controller";
import Post from "../models/post.model";
import mongoose from "mongoose";

const { find } = lodash;
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as CusRequest).user;
    if (id !== user._id) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    const { body } = req;
    const validated = await userValidation({ user: body, id: user._id });
    const message = find(validated, (item) => item != false);
    if (message) {
      return res.status(400).json({ message });
    }
    const userUpdated = await User.findByIdAndUpdate(
      user._id,
      {
        $set: { ...body, password: bcryptjs.hashSync(body.password, 10) },
      },
      { new: true }
    ).lean();
    if (!userUpdated) {
      return res.status(404).json({ message: "User not found" });
    }
    delete userUpdated.password;
    return res.status(200).json(userUpdated);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (id !== (req as CusRequest).user._id) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    await User.findByIdAndDelete(id);
    return res
      .status(204)
      .json({ success: true, message: "User has been deleted" });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    delete user.password;
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const bookmarkPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cReq = req as CusRequest;
  const userId = cReq.user._id;
  if (userId !== (req as CusRequest).user._id) {
    return next(errorHandler(403, "Access is not allowed"));
  }
  const id = req.params.id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ _id: userId, bookmarks: id }).lean();
    await User.findByIdAndUpdate(
      userId,
      !user ? { $addToSet: { bookmarks: id } } : { $pull: { bookmarks: id } }
    );
    const userUpdated = await Post.findByIdAndUpdate(
      id,
      !user
        ? { $addToSet: { bookmarks: userId }, $inc: { bookmarkNumber: 1 } }
        : { $pull: { bookmarks: userId }, $inc: { bookmarkNumber: -1 } },
      { new: true, projection: { doc: false, bookmarkNumber: 1, bookmarks: 1 } }
    );
    session.commitTransaction();
    return res.status(200).json(userUpdated);
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};
export { updateUser, deleteUser, getUser, bookmarkPost };
