import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";

import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { userRouter } from "./modules/users/user.route";
import { authRouter } from "./modules/auth/auth.route";
import { postRouter } from "./modules/posts/post.route";
import { commentRouter } from "./modules/comments/comment.route";
import { notFound } from "./modules/middlewares/notFound";
import { globalErrorHandler } from "./modules/middlewares/globalErrorHandler";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

app.use(notFound);
app.use(globalErrorHandler);
export default app;
