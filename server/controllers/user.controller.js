import lodash from "lodash";

import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import { userValidation } from "../utils/validation.js";
import bcryptjs from "bcryptjs";

const { find } = lodash;
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = req.user;
    if (userId !== user.userId) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    const { body } = req;
    const validated = await userValidation({ user: body, id: user.userId });
    const message = find(validated, (item) => item != false);
    if (message) {
      return res.status(400).json({ message });
    }
    const userUpdated = await User.findByIdAndUpdate(
      user.userId,
      {
        $set: { ...body, password: bcryptjs.hashSync(body.password, 10) },
      },
      { new: true }
    ).lean();
    const { password, ...rest } = userUpdated;
    return res.status(200).json(rest);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params;
    if (userId != req.user.userId) {
      return next(errorHandler(403, "Access is not allowed"));
    }
    await User.findByIdAndDelete(userId);
    return res
      .status(204)
      .json({ success: true, message: "User has been deleted" });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};
export { updateUser, deleteUser };
