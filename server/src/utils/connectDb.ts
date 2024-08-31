import mongoose from "mongoose";
import { config } from "dotenv";
config();
export default async () => {
  const {
    MONGO_USERNAME: user,
    MONGO_PASSWORD: pass,
    MONGO_URI: uri,
    NODE_ENV: env,
  } = process.env;
  const cnn = await mongoose.connect(
    env === "dev"
      ? "mongodb://localhost:27017/blog-app"
      : uri || "mongodb://localhost:27017/blog-app",
    {
      autoIndex: false,
      authSource: "admin",
      user,
      pass,
    }
  );
  console.log(`Connected to mongodb on port: ${cnn.connection.port}`);
};
