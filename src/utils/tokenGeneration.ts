import { sign, verify } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const jwtSecretKey = String(process.env.jwt_secret_key);

export const generateToken = (payload: any) => {
  const token = sign(payload, jwtSecretKey, { expiresIn: "45m" });
  return token;
};

export const verifyToken = (token: string) => {
  return verify(token, jwtSecretKey);
};
