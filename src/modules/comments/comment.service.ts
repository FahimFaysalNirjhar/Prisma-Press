import { prisma } from "../../lib/prisma";
import {
  ICreateComment,
  IModerateComment,
  IUpdateComment,
} from "./comment.interface";

const createCommentIntoDB = async (
  payload: ICreateComment,
  authorId: string,
) => {
  const { content, postId } = payload;

  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  const result = await prisma.comment.create({
    data: { content, postId, authorId },
  });

  return result;
};

const getCommentByAuthorIdFromDB = async (authorId: string) => {
  const result = await prisma.comment.findMany({
    where: { authorId },
    include: {
      author: {
        omit: { password: true },
      },
      post: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getCommentByIdFromDB = async (commentId: string) => {
  const result = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: {
      author: {
        omit: { password: true },
      },
      post: true,
    },
  });
  return result;
};

const updateCommentIntoDB = async (
  commentId: string,
  authorId: string,
  isAdmin: boolean,
  payload: IUpdateComment,
) => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found.");
  }

  if (!isAdmin && comment.authorId !== authorId) {
    throw new Error("You are not authorized to update this comment.");
  }

  const result = await prisma.comment.update({
    where: { id: commentId },
    data: { content: payload.content },
    include: {
      author: { omit: { password: true } },
      post: true,
    },
  });

  return result;
};

const moderateCommentIntoDB = async (
  payload: IModerateComment,
  commentId: string,
) => {
  const result = await prisma.comment.update({
    where: { id: commentId },
    data: {
      status: payload.status,
    },
    include: {
      author: { omit: { password: true } },
      post: true,
    },
  });

  return result;
};

const deleteCommentFromDB = async (
  commentId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found.");
  }

  if (!isAdmin && comment.authorId !== authorId) {
    throw new Error("You are not authorized to update this comment.");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });
};

export const commentService = {
  createCommentIntoDB,
  getCommentByAuthorIdFromDB,
  getCommentByIdFromDB,
  updateCommentIntoDB,
  moderateCommentIntoDB,
  deleteCommentFromDB,
};
