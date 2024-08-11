import { model, Schema } from "mongoose";
export interface IPost {
  title: string;
  path: string;
  doc: any;
  authorId: string;
  hashtags: Array<string>;
  [key: string]: any;
}
const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    doc: { type: Object, required: true },
    authorId: { type: String, required: true },
    hashtags: [String],
  },
  { timestamps: true }
);

const Post = model("post", postSchema);
export default Post;
