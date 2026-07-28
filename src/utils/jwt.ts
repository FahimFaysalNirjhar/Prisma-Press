import { JwtPayload, SignOptions } from "jsonwebtoken";
import jwt from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

export const jwtUtils = { createToken };
