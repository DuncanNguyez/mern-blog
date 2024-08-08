import lodash from "lodash";
import mongoose from "mongoose";
const { flatMap } = lodash;

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
};
const { blank, minLength, includes, notNull, unique } = rules;

const userValidation = async ({
  user,
  id,
  fields = ["username", "email", "password"],
}) => {
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
  };

  return await Promise.all(
    flatMap(fields, (field) => {
      return fieldsValidation[field].map(({ fun, rest }) => {
        return fun({ name: field, value: user[field], ...rest });
      });
    })
  );
};

const postValidation = ({
  post,
  fields = ["title", "doc", "authorId", "hashtags"],
}) => {
  const fieldsValidation = {
    title: [{ fun: notNull }, { fun: blank }],
    doc: [{ fun: notNull }],
    authorId: [{ fun: notNull }, { fun: blank }],
    hashtags: [{ fun: notNull }, { fun: blank }],
  };

  return flatMap(fields, (field) => {
    return fieldsValidation[field].map(({ fun, rest }) =>
      fun({ name: field, value: post[field], ...rest })
    );
  });
};

export { userValidation, postValidation };
