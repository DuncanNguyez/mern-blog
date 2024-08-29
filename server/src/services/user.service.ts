import User, { IUser } from "../models/user.model";
import redisClient, { handleRedisError } from "../redis";
import mongoose from "mongoose";
import Post from "../models/post.model";
import { elsClient } from "../elasticsearch";
import bcryptjs from "bcryptjs";
const EX = 60 * 5;
const getUser = async (id: string): Promise<IUser | null> => {
  return handleRedisError<Promise<IUser | null>>(async () => {
    const user = await redisClient.get(id);
    if (!user) {
      const user =
        (await User.findOne({ username: id }).lean()) ||
        (await User.findById(id).lean());

      await redisClient.set(id, JSON.stringify(user), { EX });
      return user;
    }
    return JSON.parse(user);
  });
};
const deleteUser = async (id: any) => {
  await User.findByIdAndDelete(id);
};
const updateUser = async (id: string, payload: any) => {
  const userUpdated = await User.findByIdAndUpdate(
    id,
    {
      $set: { ...payload, password: bcryptjs.hashSync(payload.password, 10) },
    },
    { new: true }
  ).lean();
  return userUpdated;
};
const bookmarkPost = async (userId: string | any, id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findOne({ _id: userId, bookmarks: id }).lean();
    await User.findByIdAndUpdate(
      userId,
      !user ? { $addToSet: { bookmarks: id } } : { $pull: { bookmarks: id } }
    );
    const postUpdated = await Post.findByIdAndUpdate(
      id,
      !user
        ? { $addToSet: { bookmarks: userId }, $inc: { bookmarkNumber: 1 } }
        : { $pull: { bookmarks: userId }, $inc: { bookmarkNumber: -1 } },
      { new: true, projection: { doc: false, bookmarkNumber: 1, bookmarks: 1 } }
    );
    session.commitTransaction();
    if (postUpdated) {
      await elsClient.update({
        id: postUpdated._id.toString(),
        index: "post",
        doc: {
          bookmarkNumber: postUpdated?.bookmarkNumber,
          bookmarks: postUpdated?.bookmarks,
        },
      });
    }

    return postUpdated;
  } catch (error) {
    session.endSession();
    throw error;
  }
};

export default { getUser, bookmarkPost, deleteUser, updateUser };
