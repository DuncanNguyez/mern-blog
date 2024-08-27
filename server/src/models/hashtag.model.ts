import { model, Schema } from "mongoose";
export interface IHashtag {
  name: string;
  count: number;
}
const Hashtag = model<IHashtag>(
  "hashtag",
  new Schema({
    name: { type: String, unique: true, required: true },
    count: {
      type: Number,
      default: 1,
    },
  })
);

export default Hashtag;
