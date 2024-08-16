import lodash from "lodash";
import { NextFunction, Request, Response } from "express";

import Post, { IPost } from "../models/post.model";
import generateRandomString from "../utils/generateRandomString";
import removeDiacritics from "../utils/removeDiacritics";
import { postValidation } from "../utils/validation";
import { CusRequest } from "./auth.controller";
import { FilterQuery } from "mongoose";
import { errorHandler } from "../utils/error";

const { find } = lodash;

const createPostByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, editorDoc: doc, hashtags } = req.body;
  const authorId = (req as CusRequest).user._id;
  const path =
    removeDiacritics(title).trim().toLowerCase().replace(/ /g, "-") +
    "-" +
    generateRandomString(10).toLowerCase();
  const validated = postValidation({
    post: { title, path, doc, authorId: authorId, hashtags } as IPost,
  });
  const message = find(validated, (item) => item != false);
  if (message) {
    return res.status(400).json({ message });
  }
  try {
    await Post.create({ title, path, hashtags, doc, authorId });
    return res.status(201).json({ message: "Post created successful" });
  } catch (error) {
    next(error);
  }
};
const getPost = async (req: Request, res: Response) => {
  const { path } = req.params;
  const post = await Post.findOne({ path }).lean();
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  return res.status(200).json(post);
};
const getPostsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (id !== (req as CusRequest).user._id) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    const { skip, limit } = req.query;
    const fields = req.query.fields as string;
    let projection = {};
    if (fields?.length) {
      fields
        .trim()
        .split(",")
        .forEach((field) => {
          projection = { ...projection, [field]: 1 };
        });
    }
    const posts = await Post.find({ authorId: id }, projection, {
      skip,
      limit,
      sort: { createdAt: -1 },
    } as FilterQuery<IPost>);
    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

const deletePostByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, userId } = req.params;
    if (userId !== (req as CusRequest).user._id) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    const post = await Post.findOneAndDelete({
      _id: id,
      authorId: (req as CusRequest).user._id,
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({ message: "Post has been deleted" });
  } catch (error) {
    next(error);
  }
};
const editPostByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, editorDoc: doc, hashtags } = req.body;
  const { id, userId } = req.params;
  const authorId = (req as CusRequest).user._id;
  if (userId !== authorId) {
    return next(errorHandler(403, "Access is not allowed"));
  }
  const validated = postValidation({
    post: { title, doc, authorId, hashtags } as IPost,
  });
  const message = find(validated, (item) => item != false);
  if (message) {
    return res.status(400).json({ message });
  }
  try {
    await Post.findOneAndUpdate(
      { _id: id, authorId },
      { $set: { title, hashtags, doc } }
    );
    return res.status(200).json({ message: "Post updated successful" });
  } catch (error) {
    next(error);
  }
};
const upVotePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cReq = req as CusRequest;
    const id = req.params.id;
    const post = await Post.findById(id).lean();
    const upVoted = post?.vote?.some((id) => id === cReq.user._id);
    const downVoted = post?.down?.some((id) => id === cReq.user._id);
    const postUpdated = await Post.findByIdAndUpdate(
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
      { new: true, projection: { doc: false } }
    );
    return res.status(200).json(postUpdated);
  } catch (error) {
    next(error);
  }
};
const downVotePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cReq = req as CusRequest;
    const id = req.params.id;
    const post = await Post.findById(id).lean();
    const upVoted = post?.vote?.some((id) => id === cReq.user._id);
    const downVoted = post?.down?.some((id) => id === cReq.user._id);
    const postUpdated = await Post.findByIdAndUpdate(
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
      { new: true, projection: { doc: false } }
    );
    return res.status(200).json(postUpdated);
  } catch (error) {
    next(error);
  }
};

export {
  createPostByUser,
  getPost,
  getPostsByUser,
  deletePostByUser,
  editPostByUser,
  upVotePost,
  downVotePost,
};
