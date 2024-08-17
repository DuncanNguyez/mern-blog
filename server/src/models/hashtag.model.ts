import { model, Schema } from "mongoose";

const Hashtag = model(
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
