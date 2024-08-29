import crypto from "crypto";

const hashObject = (object: Record<string, any>): string => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(object))
    .digest("hex");
};

export default hashObject
