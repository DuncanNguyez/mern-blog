import { model, Schema } from "mongoose";

interface ICommentContent {
  text?: string;
}
export interface IComment {
  postId: string;
  userId: string;
  replyToId?: string;
  vote?: Array<string>;
  voteNumber: number;
  down?: Array<string>;
  downNumber: number;
  content: ICommentContent;
  [key: string]: any;
}
const commentSchema = new Schema<IComment>(
  {
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    replyToId: { type: String },
    vote: { type: [String], default: [] },
    voteNumber: { type: Number, default: 0 },
    down: { type: [String], default: [] },
    downNumber: { type: Number, default: 0 },
    content: {
      text: { type: String },
    },
  },
  { timestamps: true }
);

const Comment = model("comment", commentSchema);
export default Comment;
