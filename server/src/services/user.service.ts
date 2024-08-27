import { ClientClosedError } from "redis";
import User, { IUser } from "../models/user.model";
import redisClient from "../redis";
const EX = 60 * 5;
const getUser = async (id: string): Promise<IUser | null> => {
  try {
    const user = await redisClient.get(id);
    if (!user) {
      const user =
        (await User.findOne({ username: id }).lean()) ||
        (await User.findById(id).lean());

      await redisClient.set(id, JSON.stringify(user), { EX });
      return user;
    }
    return JSON.parse(user);
  } catch (error: any) {
    console.log(error.message);
    if (error instanceof ClientClosedError) {
      redisClient.connect();
    }
    const user =
      (await User.findOne({ username: id }).lean()) ||
      (await User.findById(id).lean());
    return user;
  }
};

export default { getUser };
