import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILogingUser } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: ILogingUser) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password is incorrect");
  }

  const jwtPayload = {
    id: user?.id,
    email: user?.email,
    name: user?.name,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(jwtPayload, config.jwt_refesh_secret, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

export const authService = { loginUserIntoDB };
