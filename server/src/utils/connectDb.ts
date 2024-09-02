import mongoose from "mongoose";
import { config } from "dotenv";
config();
export default async () => {
  const {
    MONGO_USERNAME: user,
    MONGO_PASSWORD: pass,
    MONGO_PORT: port,
    MONGO_HOST: host,
    NODE_ENV: env,
  } = process.env;
  const cnn = await mongoose.connect(
    `mongodb://${env === "dev" ? "localhost:27017" : `${host}:${port}`}`,
    {
      autoIndex: false,
      authSource: "admin",
      user,
      pass,
      dbName: "blog-app",
    }
  );
  console.log(`Connected to mongodb on port: ${cnn.connection.port}`);
};
