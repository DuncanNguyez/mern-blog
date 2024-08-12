import { model, Schema } from "mongoose";

interface ICommentContent {
  text?: string;
}
export interface IComment {
  postId: string;
  userId: string;
  replyToId?: string;
  vote?: [string];
  down?: [string];
  content: ICommentContent;
  [key: string]: any;
}
const commentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    replyToId: { type: String, required: true },
    vote: [String],
    down: [String],
    content: {
      text: { type: String },
    },
  },
  { timestamps: true }
);

const Comment = model("comment", commentSchema);
export default Comment;
