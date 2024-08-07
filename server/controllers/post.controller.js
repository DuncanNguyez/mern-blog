import Post from "../models/post.model.js";
import { errorHandler } from "../utils/error.js";

const createPost = async (req, res, next) => {
  const { title, editorDoc: doc } = req.body;
  const authorId = req.user.userId;
  if (!title || !doc) {
    return next(errorHandler(400, "invalid title or content "));
  }
  try {
    await Post.create({ title, doc, authorId });
    return res.status(201).json({ message: "Post created successful" });
  } catch (error) {
    next(error);
  }
};

export  { createPost}
