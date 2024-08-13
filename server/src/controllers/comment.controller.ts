import { NextFunction, Request, Response } from "express";
import { CusRequest } from "./auth.controller";
import Comment, { IComment } from "../models/comment.model";
import { errorHandler } from "../utils/error";
import { FilterQuery } from "mongoose";

const createCommentByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cReq = req as CusRequest;
    const user = cReq.user;
    const comment = req.body as IComment;
    if (user._id !== comment.userId) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    const commentCreated = await Comment.create(comment);
    const doc = commentCreated._doc as IComment;
    return res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};
const deleteCommentByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cReq = req as CusRequest;
    const id = req.params.id as string;
    const user = cReq.user;
    const comment = await Comment.findOneAndDelete({
      _id: id,
      userId: user._id,
    });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ message: "Comment has been deleted" });
  } catch (error) {
    next(error);
  }
};
const getCommentsByPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, limit, onlyRoot } = req.query;
    const { id } = req.params;
    const comments = await Comment.find(
      {
        postId: id,
        ...(onlyRoot ? { replyToId: { $exists: false } } : {}),
      },
      {},
      { skip, limit, sort: { createdAt: -1 } } as FilterQuery<IComment>
    ).lean();
    if (comments?.length > 0) {
      return res.status(200).json(comments);
    }
    return res.status(200).json([]);
  } catch (error) {
    next(error);
  }
};

const getCommentsByComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { skip, limit } = req.query;
    const { replyToId } = req.params;
    const comments = await Comment.find(
      {
        replyToId,
      },
      {},
      { skip, limit, sort: { createdAt: -1 } } as FilterQuery<IComment>
    ).lean();
    if (comments?.length > 0) {
      return res.status(200).json(comments);
    }
    return res.status(200).json([]);
  } catch (error) {
    next(error);
  }
};
export {
  createCommentByUser,
  deleteCommentByUser,
  getCommentsByPost,
  getCommentsByComment,
};
