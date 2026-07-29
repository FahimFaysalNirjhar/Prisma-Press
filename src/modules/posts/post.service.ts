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

const getPostByIDFromDB = async (postId: string) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      views: { increment: 1 },
    },
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
    },
  });

  return updatedPost;
};

export const postService = {
  createPostIntoDB,
  getAllPostsFromDB,
  getPostByIDFromDB,
};
