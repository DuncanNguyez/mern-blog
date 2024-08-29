import mongoose from "mongoose";
import Comment, { IComment } from "../models/comment.model";
import Post from "../models/post.model";
import { FilterQuery } from "mongoose";
import Notification from "../models/notification.model";
import { IUser } from "../models/user.model";
import { io } from "..";
import hashObject from "../utils/hashObject";
import redisClient, { handleRedisError } from "../redis";
import handleAsyncFn from "../utils/handleAsyncFn";

const EX = 60 * 5;
const createCommentByUser = async (comment: IComment, user: IUser) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const commentCreated = await Comment.create(comment);
    const doc = commentCreated._doc as IComment;
    const post = await Post.findByIdAndUpdate(
      comment.postId,
      { $inc: { commentNumber: 1 } },
      {
        projection: { path: true, authorId: true },
      }
    ).lean();
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
    return doc;
  } catch (error) {
    session.endSession();
    throw error;
  }
};

const deleteCommentByUser = async (id: string, userId: string | any) => {
  const comment = await Comment.findOneAndDelete({
    _id: id,
    userId,
  });
  return comment;
};

const getCommentsByPost = async (
  id: string,
  skip: any,
  limit: any,
  onlyRoot: boolean
): Promise<Array<IComment>> => {
  return handleRedisError(async () => {
    const key = hashObject({ id, skip, limit, onlyRoot });
    const commentsString = await redisClient.get(key);
    if (commentsString) {
      return JSON.parse(commentsString);
    } else {
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
      handleAsyncFn(() =>
        redisClient.set(key, JSON.stringify(comments), { EX })
      );
      return comments;
    }
  });
};
const getCommentsByComment = async (
  replyToId: string,
  skip: any,
  limit: any
): Promise<Array<IComment>> => {
  return handleRedisError<Promise<Array<IComment>>>(async () => {
    const key = hashObject({ replyToId, skip, limit });
    const commentsString = await redisClient.get(key);
    if (commentsString) {
      return JSON.parse(commentsString);
    }
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
    handleAsyncFn(() => redisClient.set(key, JSON.stringify(comments), { EX }));
    return comments;
  });
};
const upvoteComment = async (
  id: string,
  userId: string | any,
  username: string | any
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const comment = await Comment.findById(id).lean();
    const upVoted = comment?.vote?.some((id) => id === userId);
    const downVoted = comment?.down?.some((id) => id === userId);
    const commentUpdated = await Comment.findByIdAndUpdate(
      id,
      {
        $inc: {
          voteNumber: upVoted ? -1 : 1,
          ...(downVoted ? { downNumber: -1 } : {}),
        },
        ...(upVoted
          ? { $pull: { vote: userId } }
          : { $addToSet: { vote: userId } }),
        ...(downVoted ? { $pull: { down: userId } } : {}),
      },
      { new: true }
    );
    if (commentUpdated && commentUpdated.userId !== userId) {
      const post = await Post.findById(commentUpdated?.postId, { path: true });
      const exists = await Notification.exists({
        userId: commentUpdated.userId,
        type: "voteComment",
        "relatedTo.comment._id": commentUpdated._id,
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
              username: username,
              _id: userId,
            },
            post: { _id: post?._id, path: post?.path },
          },
          type: "voteComment",
          message: `Your comment received upvote from ${username}`,
          link: `/posts/${post?.path}#${commentUpdated?._id}`,
        });
        io.to(notification.userId).emit("notification", notification);
      }
    }
    session.commitTransaction();
    return commentUpdated;
  } catch (error) {
    session.endSession();
    throw error;
  }
};

const downvoteComment = async (
  id: string,
  user: { _id?: string | any; username: string }
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const comment = await Comment.findById(id).lean();
    const upVoted = comment?.vote?.some((id) => id === user._id);
    const downVoted = comment?.down?.some((id) => id === user._id);
    const commentUpdated = await Comment.findByIdAndUpdate(
      id,
      {
        $inc: {
          downNumber: downVoted ? -1 : 1,
          ...(upVoted ? { voteNumber: -1 } : {}),
        },
        ...(downVoted
          ? { $pull: { down: user._id } }
          : { $addToSet: { down: user._id } }),
        ...(upVoted ? { $pull: { vote: user._id } } : {}),
      },
      { new: true }
    );
    if (commentUpdated && commentUpdated.userId !== user._id) {
      const exists = await Notification.exists({
        userId: commentUpdated.userId,
        type: "voteComment",
        "relatedTo.comment._id": commentUpdated._id,
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
              username: user.username,
              _id: user._id,
            },
            post: { _id: post?._id, path: post?.path },
          },
          type: "voteComment",
          message: `Your comment received downvote from ${user.username}`,
          link: `/posts/${post?.path}#${commentUpdated?._id}`,
        });
        io.to(notification.userId).emit("notification", notification);
      }
    }
    session.commitTransaction();
    return commentUpdated;
  } catch (error) {
    session.endSession();
    throw error;
  }
};
export default {
  createCommentByUser,
  deleteCommentByUser,
  getCommentsByPost,
  getCommentsByComment,
  upvoteComment,
  downvoteComment,
};
