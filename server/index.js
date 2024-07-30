import express from "express";
import dotenv from "dotenv";
import connectDb from "./utils/connectDb.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
await connectDb();
const app = express();
app.use(express.json());
app.use(cookieParser())

app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);

app.use((err, req, res, next) => {
  console.debug(err)
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error!";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
