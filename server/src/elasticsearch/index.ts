import { Client } from "@elastic/elasticsearch";
import { IndicesCreateRequest } from "@elastic/elasticsearch/lib/api/types";
import { createPostIndex } from "./post";
const { ELS_USERNAME: username, ELS_PASSWORD: password } = process.env;
const elsClient = new Client({
  node: "http://localhost:9200",
  auth: { username: username || "elastic", password: password || "" },
});
const elsConnect = async () => {
  const status = await elsClient.ping();
  if (!status) {
    throw new Error("ELS cant connected");
  }
  console.log("ELS connected");
  await prepare();
};
const prepare = async () => {
  createPostIndex();
};
const createIndex = async (indexCreateRequest: IndicesCreateRequest) => {
  const exists = await elsClient.indices.exists({
    index: indexCreateRequest.index,
  });
  if (!exists) {
    const res = await elsClient.indices.create(indexCreateRequest);
    console.log(res);
  }
};
export { elsClient, elsConnect, createIndex };
