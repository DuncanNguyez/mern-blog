import lodash from "lodash";
import Post from "../models/post.model.js";
import generateRandomString from "../utils/generateRandomString.js";
import removeDiacritics from "../utils/removeDiacritics.js";
import { postValidation } from "../utils/validation.js";

const { find } = lodash;

const createPost = async (req, res, next) => {
  const { title, editorDoc: doc, hashtags } = req.body;
  const authorId = req.user.userId;
  const path =
    removeDiacritics(title).trim().replaceAll(" ", "-") +
    generateRandomString(10);
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

export { createPost };
