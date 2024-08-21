import mongoose from "mongoose";
import { config } from "dotenv";
config();
export default async () => {
  const { MONGO_USERNAME: user, MONGO_PASSWORD: pass } = process.env;
  const cnn = await mongoose.connect(`mongodb://localhost:27017/blog-app`, {
    autoIndex: false,
    authSource: "admin",
    user,
    pass,
  });
  console.log(`Connected to mongodb on port: ${cnn.connection.port}`);
};
