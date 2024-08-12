import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDb from "./utils/connectDb";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import postRouter from "./routes/post.route";

dotenv.config();
connectDb();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postRouter);

app.use((err: any, req: Request, res: Response) => {
  console.debug(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error!";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
