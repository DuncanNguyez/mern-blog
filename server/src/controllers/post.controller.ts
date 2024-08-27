import lodash from "lodash";
import { NextFunction, Request, Response } from "express";

import { IPost } from "../models/post.model";
import generateRandomString from "../utils/generateRandomString";
import removeDiacritics from "../utils/removeDiacritics";
import { postValidation } from "../utils/validation";
import { CusRequest } from "./auth.controller";
import { errorHandler } from "../utils/error";
import postService from "../services/post.service";
import hashtagService from "../services/hashtag.service";

const { find } = lodash;

const createPostByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, editorDoc: doc } = req.body;
  const hashtags = req.body.hashtags?.map((tag: string) =>
    removeDiacritics(tag).trim().toLowerCase().replace(/ /g, "-")
  );

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
    await postService.createPost({
      title,
      path,
      hashtags,
      doc,
      authorId,
    } as IPost);
    return res.status(201).json({ message: "Post created successful" });
  } catch (error) {
    next(error);
  }
};
const getPost = async (req: Request, res: Response) => {
  const { path } = req.params;
  const post = await postService.getPostByPath(path);
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
    const posts = await postService.getPostsByAuthor(
      id,
      projection,
      skip,
      limit
    );
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
    await postService.deletePost(id);
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
  const { title, editorDoc: doc } = req.body;
  const hashtags = req.body.hashtags?.map((tag: string) =>
    removeDiacritics(tag).trim().toLowerCase().replace(/ /g, "-")
  );
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
    const post = await postService.updatePost(
      id,
      title,
      hashtags,
      doc,
      authorId
    );
    return res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};
const upVotePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cReq = req as CusRequest;
    const id = req.params.id;
    const postUpdated = await postService.upvotePost(id, cReq.user._id);
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
    const postUpdated = await postService.downvotePost(id, cReq.user._id);
    return res.status(200).json(postUpdated);
  } catch (error) {
    next(error);
  }
};
const getPostsBookmarksByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { skip, limit } = req.query;
  const fields = req.query.fields as string;
  let projection = {};
  if (fields?.length) {
    fields
      .trim()
      .split(",")
      .forEach((field) => {
        projection = { ...projection, [field]: true };
      });
  }
  if (id !== (req as CusRequest).user._id) {
    return res.status(403).json({ message: "Access is not allowed" });
  }
  try {
    const posts = await postService.getPostsBookmarksByUser(
      id,
      projection,
      skip,
      limit
    );
    return res.status(200).json(posts || []);
  } catch (error) {
    next(error);
  }
};
const getHashtags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashtags = await hashtagService.getAll();
    return res.status(200).json(hashtags);
  } catch (error) {
    next(error);
  }
};
const getPostsByTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tag } = req.params;
    const { skip, limit } = req.query;
    const fields = req.query.fields as string;
    let projection = {};
    if (fields?.length) {
      fields
        .trim()
        .split(",")
        .forEach((field) => {
          projection = { ...projection, [field]: true };
        });
    }
    const posts = await postService.getPostsByTag(tag, projection, skip, limit);
    return res.status(200).json(posts || []);
  } catch (error) {
    next(error);
  }
};
const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, limit } = req.query;
    const fields = req.query.fields as string;
    const hashtags = req.query.hashtags as string;
    const hashtagsArr =
      hashtags && hashtags.length > 0 ? hashtags.trim().split(",") : [];
    let projection = {};
    if (fields?.length) {
      fields
        .trim()
        .split(",")
        .forEach((field) => {
          projection = { ...projection, [field]: true };
        });
    }
    const posts = await postService.getPosts(
      projection,
      skip,
      limit,
      hashtagsArr
    );
    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = req.query.s as string;
    const { skip, limit } = req.query;
    const elsRes = await postService.search(s, skip, limit);
    return res.status(200).json(elsRes);
  } catch (error) {
    next(error);
  }
};

export {
  getPosts,
  createPostByUser,
  getPost,
  getPostsByUser,
  deletePostByUser,
  editPostByUser,
  upVotePost,
  downVotePost,
  getPostsBookmarksByUser,
  getHashtags,
  getPostsByTag,
  search,
};
