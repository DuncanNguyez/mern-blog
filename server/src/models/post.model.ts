import { model, Schema } from "mongoose";
export interface IPost {
  title: string;
  path: string;
  doc: any;
  authorId: string;
  hashtags: Array<string>;
  vote?: Array<string>;
  voteNumber: number;
  down?: Array<string>;
  downNumber: number;
  bookmarks?: Array<string>;
  bookmarkNumber?: number;
  [key: string]: any;
}
const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    path: { type: String, required: true, unique: true },
    doc: { type: Object, required: true },
    authorId: { type: String, required: true },
    hashtags: [String],
    vote: [String],
    voteNumber: { type: Number, default: 0 },
    down: [String],
    downNumber: { type: Number, default: 0 },
    bookmarks: [String],
    bookmarkNumber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Post = model("post", postSchema);
export default Post;
