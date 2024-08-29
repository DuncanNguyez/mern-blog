import { NextFunction, Request, Response } from "express";
import { CusRequest } from "./auth.controller";
import { IComment } from "../models/comment.model";
import { errorHandler } from "../utils/error";
import commentService from "../services/comment.service";

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
    const doc = await commentService.createCommentByUser(comment, user);
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
    const comment = await commentService.deleteCommentByUser(id, user._id);
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
    const comments = await commentService.getCommentsByPost(
      id,
      skip,
      limit,
      !!onlyRoot
    );
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
    const comments = await commentService.getCommentsByComment(
      replyToId,
      skip,
      limit
    );
    if (comments?.length > 0) {
      return res.status(200).json(comments);
    }
    return res.status(200).json([]);
  } catch (error) {
    next(error);
  }
};
const upVoteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cReq = req as CusRequest;
    const id = req.params.id;
    const commentUpdated = await commentService.upvoteComment(
      id,
      cReq.user._id,
      cReq.user.username
    );
    return res.status(200).json(commentUpdated);
  } catch (error) {
    next(error);
  }
};
const downVoteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cReq = req as CusRequest;
    const id = req.params.id;
    const commentUpdated = await commentService.downvoteComment(id, cReq.user);
    return res.status(200).json(commentUpdated);
  } catch (error) {
    next(error);
  }
};

export {
  createCommentByUser,
  deleteCommentByUser,
  getCommentsByPost,
  getCommentsByComment,
  upVoteComment,
  downVoteComment,
};
