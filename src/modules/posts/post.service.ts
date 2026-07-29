import { prisma } from "../../lib/prisma";
import { ICreatePost } from "./post.interface";

const createPostIntoDB = async (payload: ICreatePost, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

export const postService = { createPostIntoDB };
