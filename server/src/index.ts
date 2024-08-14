import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import connectDb from "./utils/connectDb";
import userRouter from "./routes/user.route";
import authRouter from "./routes/auth.route";
import postRouter from "./routes/post.route";
import commentRouter from "./routes/comment.route";
import { swaggerSpec } from "./swagger";

dotenv.config();
connectDb();
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);

app.use("/docs", swaggerUi.serve,swaggerUi.setup(swaggerSpec));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.debug(err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error!";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
  next();
});

app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});
