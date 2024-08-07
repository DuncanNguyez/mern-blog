import { model, Schema } from "mongoose";
const postSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    doc: { type: Object, required: true },
    authorId: { type: String, required: true },
  },
  { timestamps: true }
);

const Post = model("post", postSchema);
export default Post;
