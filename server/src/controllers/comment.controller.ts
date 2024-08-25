import { NextFunction, Request, Response } from "express";
import { CusRequest } from "./auth.controller";
import Comment, { IComment } from "../models/comment.model";
import { errorHandler } from "../utils/error";
import mongoose, { FilterQuery } from "mongoose";
import Notification from "../models/notification.model";
import Post from "../models/post.model";
import { io } from "..";

const createCommentByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await mongoose.startSession();
  try {
    const cReq = req as CusRequest;
    const user = cReq.user;
    const comment = req.body as IComment;
    if (user._id !== comment.userId) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    session.startTransaction();
    const commentCreated = await Comment.create(comment);
    const doc = commentCreated._doc as IComment;
    const post = await Post.findById(comment.postId, {
      path: true,
      authorId: true,
    }).lean();
    if (commentCreated && commentCreated.userId !== post?.authorId) {
      const notification = await Notification.create({
        userId: post?.authorId,
        relatedTo: {
          comment: {
            _id: commentCreated._id,
            content: commentCreated.content,
          },
          user: {
            username: user.username,
            _id: user._id,
          },
          post: { _id: post?._id, path: post?.path },
        },
        type: "commentPost",
        message: `Replied from ${user.username}`,
        link: `/posts/${post?.path}#${commentCreated?._id}`,
      });
      io.to(notification.userId).emit("notification", notification);
    }
    if (
      commentCreated.replyToId &&
      commentCreated.replyToId !== commentCreated.userId
    ) {
      const replyToComment = await Comment.findById(commentCreated.replyToId);
      if (doc.userId !== replyToComment?.userId) {
        const notification = await Notification.create({
          userId: replyToComment?.userId,
          relatedTo: {
            comment: {
              _id: commentCreated._id,
              content: commentCreated.content,
            },
            user: {
              username: user.username,
              _id: user._id,
            },
            post: { _id: post?._id, path: post?.path },
          },
          type: "replyComment",
          message: `Replied from ${user.username}`,
          link: `/posts/${post?.path}#${commentCreated?._id}`,
        });
        io.to(notification.userId).emit("notification", notification);
      }
    }
    session.commitTransaction();
    return res.status(201).json(doc);
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
      {
        sort: { voteNumber: -1, createdAt: 1 },
        skip,
        limit,
      } as FilterQuery<IComment>
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
      {
        sort: { voteNumber: -1, createdAt: 1 },
        skip,
        limit,
      } as FilterQuery<IComment>
    ).lean();
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
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const cReq = req as CusRequest;
    const id = req.params.id;
    const comment = await Comment.findById(id).lean();
    const upVoted = comment?.vote?.some((id) => id === cReq.user._id);
    const downVoted = comment?.down?.some((id) => id === cReq.user._id);
    const commentUpdated = await Comment.findByIdAndUpdate(
      id,
      {
        $inc: {
          voteNumber: upVoted ? -1 : 1,
          ...(downVoted ? { downNumber: -1 } : {}),
        },
        ...(upVoted
          ? { $pull: { vote: cReq.user._id } }
          : { $addToSet: { vote: cReq.user._id } }),
        ...(downVoted ? { $pull: { down: cReq.user._id } } : {}),
      },
      { new: true }
    );
    if (commentUpdated && commentUpdated.userId !== cReq.user._id) {
      const post = await Post.findById(commentUpdated?.postId, { path: true });
      const exists = await Notification.exists({
        userId: commentUpdated.userId,
        type: "voteComment",
      });
      if (!exists) {
        const notification = await Notification.create({
          userId: commentUpdated?.userId,
          relatedTo: {
            comment: {
              _id: commentUpdated._id,
              content: commentUpdated.content,
            },
            user: {
              username: cReq.user.username,
              _id: cReq.user._id,
            },
            post: { _id: post?._id, path: post?.path },
          },
          type: "voteComment",
          message: `Your comment received upvote from ${cReq.user.username}`,
          link: `/posts/${post?.path}#${commentUpdated?._id}`,
        });
        io.to(notification.userId).emit("notification", notification);
      }
    }
    session.commitTransaction();
    return res.status(200).json(commentUpdated);
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
    const comment = await Comment.findById(id).lean();
    const upVoted = comment?.vote?.some((id) => id === cReq.user._id);
    const downVoted = comment?.down?.some((id) => id === cReq.user._id);
    const commentUpdated = await Comment.findByIdAndUpdate(
      id,
      {
        $inc: {
          downNumber: downVoted ? -1 : 1,
          ...(upVoted ? { voteNumber: -1 } : {}),
        },
        ...(downVoted
          ? { $pull: { down: cReq.user._id } }
          : { $addToSet: { down: cReq.user._id } }),
        ...(upVoted ? { $pull: { vote: cReq.user._id } } : {}),
      },
      { new: true }
    );
    if (commentUpdated && commentUpdated.userId !== cReq.user._id) {
      const exists = await Notification.exists({
        userId: commentUpdated.userId,
        type: "voteComment",
      });
      if (!exists) {
        const post = await Post.findById(commentUpdated?.postId, {
          path: true,
        });
        const notification = await Notification.create({
          userId: commentUpdated?.userId,
          relatedTo: {
            comment: {
              _id: commentUpdated._id,
              content: commentUpdated.content,
            },
            user: {
              username: cReq.user.username,
              _id: cReq.user._id,
            },
            post: { _id: post?._id, path: post?.path },
          },
          type: "voteComment",
          message: `Your comment received downvote from ${cReq.user.username}`,
          link: `/posts/${post?.path}#${commentUpdated?._id}`,
        });
        io.to(notification.userId).emit("notification", notification);
      }
    }
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
