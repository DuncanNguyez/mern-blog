import jwt from "jsonwebtoken";
export default function getTokens(payload: any) {
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
  return { token, refreshToken };
}
