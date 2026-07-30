import { prisma } from "../../lib/prisma";
import { ICreatePost, IUpdatePostPayload } from "./post.interface";

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

const getMyPostsFromDB = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: { authorId },
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
      _count: { select: { comments: true } },
    },
  });
  return result;
};

const updatePostIntoDB = async (
  postId: string,
  authorId: string,
  payload: IUpdatePostPayload,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post");
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data: payload,
    include: {
      author: { omit: { password: true } },
      comments: true,
    },
  });
  return result;
};

export const postService = {
  createPostIntoDB,
  getAllPostsFromDB,
  getPostByIDFromDB,
  getMyPostsFromDB,
  updatePostIntoDB,
};
