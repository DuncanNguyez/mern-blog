import { createClient, ClientClosedError } from "redis";
import { config } from "dotenv";
config();
const { REDIS_USERNAME: username, REDIS_PASSWORD: password } = process.env;

const redisClient = createClient({
  username,
  password,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        return new Error("Redis server is not responding");
      }
      return 2000;
    },
  },
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .on("ready", () => console.log("Redis connected"));

export const redisConnect = async () => redisClient.connect();
export const handleRedisError = async <O>(fn: () => O) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ClientClosedError) {
      redisClient.connect();
    }
    throw error;
  }
};

export default redisClient;
