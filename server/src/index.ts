import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { errorHandler } from "./utils/error";
import jwt from "jsonwebtoken";
import getTokens from "./utils/getTokens";

export const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  cookie: true,
});

io.on("connection", (socket) => {
  const count = io.engine.clientsCount;
  console.log("users: " + count);
  const token = socket.handshake.auth.refreshToken;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, payload: any) => {
        if (err) {
          return;
        }
        delete payload.exp;
        delete payload.iat;
        const tokens = getTokens(payload);
        socket.join(payload._id);
        socket.emit("connected", JSON.stringify(tokens));
      }
    );
  }

  socket.use(async (e, next) => {
    const token = socket.handshake.auth.access_token;
    if (token) {
      try {
        const result = (await new Promise((resolve, reject) => {
          jwt.verify(
            token,
            process.env.JWT_SECRET as string,
            (err: any, payload: any) => {
              if (err) {
                reject(err);
              }
              socket.handshake.auth = { user: payload };
              resolve(payload);
            }
          );
        })) as { _id: string; username: string; isAuthor: boolean };
        if (result) {
          socket.join(result._id);
          return next();
        }
        next(errorHandler(401, "unauthorized"));
      } catch (error: any) {
        console.log(error.message);
        next(errorHandler(401, "unauthorized"));
      }
    } else {
      next(errorHandler(401, "unauthorized"));
    }
  });

  // socket.on("error", (err) => {
  //   const error = err as CustomError;
  //   if (error && error.statusCode === 401) {
  //     socket.disconnect();
  //   }
  // });
});

io.engine.on("connection_error", (err) => {
  // console.log(err.req);      // the request object
  // console.log(err.code);     // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  // console.log(err.context);  // some additional error context
});

httpServer.listen(3000, () => {
  console.log("Server is running on port: 3000");
});
export { io };
