import { NextFunction, Response, Request } from "express";
import lodash from "lodash";
import bcryptjs from "bcryptjs";

import User from "../models/user.model";
import { errorHandler } from "../utils/error";
import { userValidation } from "../utils/validation";
import { CusRequest } from "./auth.controller";

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
    delete user.password
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
export { updateUser, deleteUser ,getUser};
