import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILogingUser } from "./auth.interface";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const loginUserIntoDB = async (payload: ILogingUser) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email,
    },
  });

  if (user.activeStatus === "BLOCKED") {
    throw new Error("Your account has been blocked. Please contact support");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("Password is incorrect");
  }

  const jwtPayload = {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    role: user?.role,
  };

  // const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret, {
  //   expiresIn: "1d",
  // });

  // const refreshToken = jwt.sign(jwtPayload, config.jwt_refesh_secret, {
  //   expiresIn: "7d",
  // });
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refesh_secret,
    config.jwt_refresh_expiries_in as SignOptions,
  );

  return { accessToken, refreshToken };
};

const issueRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refesh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }
  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
  });

  if (user.activeStatus === "BLOCKED") {
    throw new Error("Your account has been blocked. Please contact support");
  }

  const jwtPayload = {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    role: user?.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  return { accessToken };
};

export const authService = { loginUserIntoDB, issueRefreshToken };
