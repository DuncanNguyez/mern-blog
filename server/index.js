import express from "express";
import dotenv from "dotenv";
import connectDb from "./connectDb.js";

dotenv.config();
await connectDb();
const app = express();

app.listen(3000, () => {
  console.log("Server is running on port: 3000");
});
