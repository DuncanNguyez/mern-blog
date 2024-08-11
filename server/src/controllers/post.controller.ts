import lodash from "lodash";
import { NextFunction, Request, Response } from "express";

import Post, { IPost } from "../models/post.model";
import generateRandomString from "../utils/generateRandomString";
import removeDiacritics from "../utils/removeDiacritics";
import { postValidation } from "../utils/validation";
import { CusRequest } from "./auth.controller";
import { FilterQuery } from "mongoose";

const { find } = lodash;

const createPostByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, editorDoc: doc, hashtags } = req.body;
  const authorId = (req as CusRequest).user.userId;
  const path =
    removeDiacritics(title).trim().toLowerCase().replace(/ /g, "-") +
    "-" +
    generateRandomString(10).toLowerCase();
  const validated = postValidation({
    post: { title, path, doc, authorId, hashtags },
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
const getPost = async (req: Request, res: Response, next: NextFunction) => {
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
    const id = (req as CusRequest).user.userId;
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
const getPostByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { path } = req.params;
    const { userId } = (req as CusRequest).user;
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
    const post = await Post.findOne(
      { path, authorId: userId },
      projection
    ).lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json(post);
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
    const { id } = req.params;
    const post = await Post.findOneAndDelete({
      _id: id,
      authorId: (req as CusRequest).user.userId,
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
  const { id } = req.params;
  const authorId = (req as CusRequest).user.userId;
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
export {
  createPostByUser,
  getPost,
  getPostsByUser,
  getPostByUser,
  deletePostByUser,
  editPostByUser,
};
