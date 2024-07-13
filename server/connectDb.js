import mongoose from "mongoose";

export default async () => {
  const { MONGO_USERNAME: username, MONGO_PASSWORD: password } = process.env;
  const cnn = await mongoose.connect(
    `mongodb://${username}:${password}@localhost:27017/blog-app?authSource=admin`
  );
  console.log(`Connected to mongodb on port: ${cnn.connection.port}`);
};
