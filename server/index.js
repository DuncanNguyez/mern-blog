import express from "express";
import dotenv from "dotenv";
import connectDb from "./connectDb.js";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";

dotenv.config();
await connectDb();
const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);
