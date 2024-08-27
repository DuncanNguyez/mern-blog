import { createServer } from "http";
import app from "./app";
import { elsConnect } from "./elasticsearch";
import dotenv from "dotenv";
import connectDb from "./utils/connectDb";
import { redisConnect } from "./redis";
import createSocketIo from "./socketio";

const httpServer = createServer(app);
const io = createSocketIo(httpServer);

const start = async () => {
  dotenv.config();
  await connectDb();
  try {
    await Promise.all([elsConnect(), redisConnect()]);
  } catch (error) {
    console.debug(error);
  }

  httpServer.listen(3000, () => {
    console.log("Server is running on port: 3000");
  });
};
start();
export { io, httpServer };
