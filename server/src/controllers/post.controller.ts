import lodash from "lodash";
import { NextFunction, Request, Response } from "express";

import Post, { extractTextFromJSON, IPost } from "../models/post.model";
import generateRandomString from "../utils/generateRandomString";
import removeDiacritics from "../utils/removeDiacritics";
import { postValidation } from "../utils/validation";
import { CusRequest } from "./auth.controller";
import mongoose, { FilterQuery } from "mongoose";
import { errorHandler } from "../utils/error";
import Hashtag from "./../models/hashtag.model";
import { elsClient } from "../elasticsearch";
import { StrictPostProperties } from "../elasticsearch/post";

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
    hashtags.map((tag: string) =>
      Hashtag.findOneAndUpdate(
        { name: tag },
        { $set: { name: tag }, $inc: { count: 1 } },
        { upsert: true }
      )
    );
    const post = await Post.create({ title, path, hashtags, doc, authorId });
    if (post) {
      const elsDoc: StrictPostProperties = {
        title: post.title,
        path: post.path,
        textContent: extractTextFromJSON(post.doc),
        authorId: post.authorId,
        hashtags: post.hashtags,
        vote: post.vote,
        voteNumber: post.voteNumber,
        down: post.dow,
        downNumber: post.downNumber,
        bookmarks: post.bookmarks,
        bookmarkNumber: post.bookmarkNumber,
        createdAt: post.createdAt,
        updatedAt: post.updateAt,
      };
      await elsClient.index({
        index: "post",
        id: post._id.toString(),
        document: elsDoc,
      });
    }
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
    } as FilterQuery<IPost>).lean();
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
  const session = await mongoose.startSession();
  try {
    const { id, userId } = req.params;
    if (userId !== (req as CusRequest).user._id) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    session.startTransaction();
    const post = await Post.findOneAndDelete({
      _id: id,
      authorId: (req as CusRequest).user._id,
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.hashtags.map((tag) =>
      Hashtag.findOneAndUpdate({ name: tag }, { $inc: { count: -1 } })
    );
    await elsClient.delete({ id, index: "post" });
    session.commitTransaction();
    return res.status(200).json({ message: "Post has been deleted" });
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
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
    const post = await Post.findOneAndUpdate(
      { _id: id, authorId },
      { $set: { title, hashtags, doc } }
    );
    hashtags?.map((tag: string) =>
      Hashtag.findOneAndUpdate(
        { name: tag },
        {
          $set: { name: tag },
          ...(post
            ? {
                ...(!post.hashtags.includes(tag)
                  ? { $inc: { count: -1 } }
                  : {}),
              }
            : {}),
        },
        { upsert: true }
      )
    );
    const newPost = await Post.findById(id).lean();
    if (newPost)
      await elsClient.update({
        index: "post",
        id: newPost._id.toString(),
        doc: {
          textContent: extractTextFromJSON(newPost.doc),
          title,
          updatedAt: newPost.updatedAt,
          hashtags: newPost.hashtags,
        },
      });
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
    if (postUpdated) {
      await elsClient.update({
        index: "post",
        id: postUpdated._id.toString(),
        doc: {
          vote: postUpdated.vote,
          voteNumber: postUpdated.voteNumber,
          down: postUpdated.down,
          downNumber: postUpdated.downNumber,
        },
      });
    }
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
    if (postUpdated) {
      await elsClient.update({
        index: "post",
        id: postUpdated._id.toString(),
        doc: {
          vote: postUpdated.vote,
          voteNumber: postUpdated.voteNumber,
          down: postUpdated.down,
          downNumber: postUpdated.downNumber,
        },
      });
    }
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
    const posts = await Post.find({ bookmarks: id }, projection, {
      skip,
      limit,
      sort: { createdAt: -1 },
    } as FilterQuery<IPost>).lean();
    return res.status(200).json(posts || []);
  } catch (error) {
    next(error);
  }
};
const getHashtags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashtags = await Hashtag.find().lean();
    return res.status(200).json(hashtags.map(({ name }) => name) || []);
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
    const posts = await Post.find({ hashtags: tag }, projection, {
      skip,
      limit,
      sort: { createdAt: -1 },
    } as FilterQuery<IPost>).lean();
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
    const posts = await Post.find(
      { ...(hashtags?.length > 0 ? { hashtags: { $all: hashtagsArr } } : {}) },
      projection,
      {
        skip,
        limit,
        sort: { createdAt: -1 },
      } as FilterQuery<IPost>
    ).lean();
    return res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};
const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const s = req.query.s as string;
    const { skip, limit } = req.query;
    const elsRes = await elsClient.search({
      index: "post",
      query: {
        multi_match: {
          query: s,
          fields: [
            "hashtags^3",
            "title^2",
            "title._2gram^2",
            "textContent",
            "textContent._2gram",
          ],
          fuzziness: "AUTO",
        },
      },
      highlight: {
        fields: {
          title: {
            number_of_fragments: 1,
          },
          textContent: {
            fragment_size: 500,
            number_of_fragments: 1,
          },
          hashtags: {
            number_of_fragments: 3,
          },
        },
        pre_tags: ["<em class='search-hightlight'>"],
        post_tags: ["</em> "],
      },
      _source: ["path", "title"],
      ...(limit ? { size: limit } : {}),
      ...(skip ? { from: skip } : {}),
    });
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
