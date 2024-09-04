import { model, Schema } from "mongoose";
import { ICommentContent } from "./comment.model";

type RelatedTo = {
  comment?: {
    _id: string;
    content: ICommentContent;
  };
  user?: { username: string; _id: string };
  post?: { _id: string; path: string };
};
type NotificationType =
  | "voteComment"
  | "votePost"
  | "commentPost"
  | "replyComment";
export interface INotification {
  _id?: string;
  link: string;
  userId: string;
  relatedTo: RelatedTo;
  type: NotificationType;
  message: string;
  read: boolean;
  [key: string]: any;
}

const notificationSchema = new Schema<INotification>(
  {
    link: String,
    userId: { type: String, required: true },
    relatedTo: {
      comment: {
        _id: String,
        content: { text: { type: String, default: "" } },
      },
      user: {
        username: String,
        _id: String,
      },
      post: { _id: String, path: String },
    },
    type: {
      type: String,
      enum: ["voteComment", "votePost", "commentPost", "replyComment"],
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = model("notification", notificationSchema);

export default Notification;
