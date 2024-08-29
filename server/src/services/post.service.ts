import { FilterQuery, ProjectionType } from "mongoose";
import { elsClient } from "../elasticsearch";
import { StrictPostProperties } from "../elasticsearch/post";
import Post, { extractTextFromJSON, IPost } from "../models/post.model";
import mongoose from "mongoose";
import Hashtag from "../models/hashtag.model";
import redisClient, { handleRedisError } from "../redis";
import handleAsyncFn from "../utils/handleAsyncFn";
import hashObject from "../utils/hashObject";
const EX = 60 * 5; // 5 minutes
const createPost = async ({ title, path, hashtags, doc, authorId }: IPost) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await Promise.all(
      hashtags.map((tag: string) =>
        Hashtag.findOneAndUpdate(
          { name: tag },
          { $set: { name: tag }, $inc: { count: 1 } },
          { upsert: true }
        )
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
    session.commitTransaction();
    return post;
  } catch (error) {
    session.endSession();
    throw error;
  }
};
const updatePost = async (
  _id: string,
  title: string,
  hashtags: [string],
  doc: any,
  authorId: string
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const post = await Post.findOneAndUpdate(
      { _id, authorId },
      { $set: { title, hashtags, doc } },
      { new: true }
    );
    await Promise.all(
      hashtags.map((tag: string) =>
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
      )
    );
    if (post) {
      await elsClient.update({
        index: "post",
        id: post._id.toString(),
        doc: {
          textContent: extractTextFromJSON(post.doc),
          title,
          updatedAt: post.updatedAt,
          hashtags: post.hashtags,
        },
      });
    }
    session.commitTransaction();
    return post;
  } catch (error) {
    session.endSession();
    throw error;
  }
};
const getPostByPath = async (path: string) => {
  return handleRedisError<Promise<IPost>>(async () => {
    const postString = await redisClient.get(path);
    if (postString) {
      return JSON.parse(postString);
    }
    const post = await Post.findOne({ path }).lean();
    handleAsyncFn(() => redisClient.set(path, JSON.stringify(post), { EX }));
    return post;
  });
};

const getPostsByAuthor = async (
  authorId: string,
  projection: ProjectionType<IPost>,
  skip: number | string | any,
  limit: number | string | any
) => {
  return handleRedisError<Promise<Array<IPost>>>(async () => {
    const key = hashObject({ authorId, projection, skip, limit, type: "post" });
    const postsString = await redisClient.get(key);
    if (postsString) {
      return JSON.parse(postsString);
    }
    const posts = await Post.find({ authorId }, projection, {
      skip,
      limit,
      sort: { createdAt: -1 },
    } as FilterQuery<IPost>).lean();
    handleAsyncFn(() => redisClient.set(key, JSON.stringify(posts), { EX }));
    return posts;
  });
};
const deletePost = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const post = await Post.findOneAndDelete({ _id: id });
    if (!post) {
      return;
    }
    await Promise.all(
      post.hashtags.map((tag) =>
        Hashtag.findOneAndUpdate({ name: tag }, { $inc: { count: -1 } })
      )
    );
    await elsClient.delete({ id, index: "post" });
    session.commitTransaction();
  } catch (error) {
    session.endSession();
    throw error;
  }
};

const upvotePost = async (id: string, userId: string | any) => {
  const post = await Post.findById(id).lean();
  const upVoted = post?.vote?.some((id) => id === userId);
  const downVoted = post?.down?.some((id) => id === userId);
  const postUpdated = await Post.findByIdAndUpdate(
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
  return postUpdated;
};

const downvotePost = async (id: string, userId: string | any) => {
  const post = await Post.findById(id).lean();
  const upVoted = post?.vote?.some((id) => id === userId);
  const downVoted = post?.down?.some((id) => id === userId);
  const postUpdated = await Post.findByIdAndUpdate(
    id,
    {
      $inc: {
        downNumber: downVoted ? -1 : 1,
        ...(upVoted ? { voteNumber: -1 } : {}),
      },
      ...(downVoted
        ? { $pull: { down: userId } }
        : { $addToSet: { down: userId } }),
      ...(upVoted ? { $pull: { vote: userId } } : {}),
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
  return postUpdated;
};

const getPostsBookmarksByUser = async (
  userId: string,
  projection: ProjectionType<IPost>,
  skip: number | string | any,
  limit: number | string | any
) => {
  return handleRedisError<Promise<Array<IPost>>>(async () => {
    const key = hashObject({ userId, projection, skip, limit, type: "post" });
    const postsString = await redisClient.get(key);
    if (postsString) {
      return JSON.parse(postsString);
    }
    const posts = await Post.find({ bookmarks: userId }, projection, {
      skip,
      limit,
      sort: { createdAt: -1 },
    } as FilterQuery<IPost>).lean();
    handleAsyncFn(() => redisClient.set(key, JSON.stringify(posts), { EX }));
    return posts;
  });
};
const getHashtags = async () => {};
const getPostsByTag = async (
  tag: string,
  projection: ProjectionType<IPost>,
  skip: number | string | any,
  limit: number | string | any
) => {
  return handleRedisError<Promise<Array<IPost>>>(async () => {
    const key = hashObject({ tag, projection, skip, limit, type: "post" });
    const postsString = await redisClient.get(key);
    if (postsString) {
      return JSON.parse(postsString);
    }
    const posts = await Post.find({ hashtags: tag }, projection, {
      skip,
      limit,
      sort: { createdAt: -1 },
    } as FilterQuery<IPost>).lean();
    handleAsyncFn(() => redisClient.set(key, JSON.stringify(posts), { EX }));
    return posts;
  });
};
const getPosts = async (
  projection: ProjectionType<IPost>,
  skip: any,
  limit: any,
  hashtags: string[] = []
) => {
  return handleRedisError<Promise<Array<IPost>>>(async () => {
    const key = hashObject({ projection, skip, limit, hashtags, type: "post" });
    const postsString = await redisClient.get(key);
    if (postsString) {
      return JSON.parse(postsString);
    }
    const posts = await Post.find(
      { ...(hashtags.length > 0 ? { hashtags: { $all: hashtags } } : {}) },
      projection,
      {
        skip,
        limit,
        sort: { createdAt: -1 },
      } as FilterQuery<IPost>
    ).lean();
    handleAsyncFn(() => redisClient.set(key, JSON.stringify(posts), { EX }));
    return posts;
  });
};
const search = async (s: string, skip: any, limit: any) => {
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
  return elsRes;
};

export default {
  createPost,
  getPostByPath,
  getPostsByAuthor,
  deletePost,
  updatePost,
  upvotePost,
  downvotePost,
  getPostsBookmarksByUser,
  getHashtags,
  getPostsByTag,
  getPosts,
  search,
};
