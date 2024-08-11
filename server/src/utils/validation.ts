import lodash from "lodash";
import mongoose from "mongoose";
import { IUser } from "../models/user.model";
import { IPost } from "../models/post.model";
const { flatMap } = lodash;

type RulesFun = {
  [key: string]: (
    options: Record<string, any>
  ) => string | false | Promise<string | false>;
};
const rules = {
  notNull: ({ name, value }) =>
    value === null || value === undefined ? `${name} is not null` : false,
  blank: ({ name, value }) =>
    value.length === 0 ? `${name} is not blank` : false,
  minLength: ({ name, value, check }) =>
    value?.length < check
      ? `${name} must be at least ${check} characters`
      : false,
  includes: ({ name, value, check }) =>
    value?.includes(check) ? `${name} can not contain '${check}'` : false,
  unique: async ({ name, value, modelName, docId }) => {
    const doc = await mongoose
      .model(modelName)
      .findOne({ [name]: value, _id: { $ne: docId } })
      .lean();
    return doc !== null ? `${name} is already` : false;
  },
} as RulesFun;
const { blank, minLength, includes, notNull, unique } = rules;

type UserValidationOptions = { user: IUser; id?: string; fields?: Array<keyof IUser> };
const userValidation = async (options: UserValidationOptions) => {
  const { user, id, fields } = options;
  const fieldsValidation = {
    username: [
      { fun: notNull },
      { fun: blank },
      { fun: minLength, rest: { check: 6 } },
      { fun: includes, rest: { check: " " } },
      { fun: unique, rest: { modelName: "User", docId: id } },
    ],
    email: [
      { fun: notNull },
      { fun: blank },
      { fun: unique, rest: { modelName: "User", docId: id } },
    ],
    password: [
      { fun: notNull },
      { fun: blank },
      { fun: includes, rest: { check: " " } },
      { fun: minLength, rest: { check: 6 } },
    ],
  } as any;

  return await Promise.all(
    flatMap(fields, (field) => {
      return fieldsValidation[field].map(({ fun, rest }: any) => {
        return fun({ name: field, value: user[field], ...rest });
      });
    })
  );
};
type PostValidationOptions = {
  post: IPost;
  fields?: Array<keyof IPost>;
};
const postValidation = (options: PostValidationOptions) => {
  const { post, fields } = options;
  const fieldsValidation = {
    title: [{ fun: notNull }, { fun: blank }],
    doc: [{ fun: notNull }],
    authorId: [{ fun: notNull }, { fun: blank }],
    hashtags: [{ fun: notNull }, { fun: blank }],
  } as any;

  return flatMap(fields, (field) => {
    return fieldsValidation[field].map(({ fun, rest }: any) =>
      fun({ name: field, value: post[field], ...rest })
    );
  });
};

export { userValidation, postValidation };
