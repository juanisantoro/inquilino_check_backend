import jwt from "jsonwebtoken";

export function signJWT(data) {
  return jwt.sign(data, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
}
