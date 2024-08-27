import { NextFunction, Response, Request } from "express";
import lodash from "lodash";

import { errorHandler } from "../utils/error";
import { userValidation } from "../utils/validation";
import { CusRequest } from "./auth.controller";
import userService from "../services/user.service";
import notificationService from "../services/notification.service";
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
    const userUpdated = await userService.updateUser(id, body);
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
    await userService.deleteUser(id);
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
    const user = await userService.getUser(id);
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
  try {
    const cReq = req as CusRequest;
    const userId = cReq.user._id;
    if (userId !== (req as CusRequest).user._id) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    const id = req.params.id;
    const postUpdated = await userService.bookmarkPost(userId, id);
    return res.status(200).json(postUpdated);
  } catch (error) {
    next(error);
  }
};

const getNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cReq = req as CusRequest;
    const { user } = cReq;
    const { fromCreatedAt } = req.query;
    const notifications = notificationService.getNotificationByUser(
      user._id,
      fromCreatedAt as string
    );
    return res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
const readNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cReq = req as CusRequest;
    const { ids } = req.body;
    const { user } = cReq;
    await notificationService.readNotification(user._id as string, ids);
    return res.status(200).json({ message: "Success" });
  } catch (error) {
    next(error);
  }
};
export {
  updateUser,
  deleteUser,
  getUser,
  bookmarkPost,
  getNotification,
  readNotification,
};
