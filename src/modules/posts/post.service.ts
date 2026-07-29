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

const getAllPostsFromDB = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
    },
  });

  return posts;
};

export const postService = { createPostIntoDB, getAllPostsFromDB };
