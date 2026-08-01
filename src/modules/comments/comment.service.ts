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
      // author: {
      //   omit: { password: true },
      // },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return result;
};

const getCommentByIdFromDB = async (commentId: string) => {
  const result = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    include: {
      // author: {
      //   omit: { password: true },
      // },
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });
  return result;
};

const updateCommentIntoDB = async (
  commentId: string,
  authorId: string,
  payload: IUpdateComment,
) => {
  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    // select: {
    //   id: true,
    // },
  });

  // if (!comment) {
  //   throw new Error("Comment not found.");
  // }

  if (comment.authorId !== authorId) {
    throw new Error("You are not authorized to update this comment.");
  }

  const result = await prisma.comment.update({
    where: { id: comment.id },
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
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
    select: {
      id: true,
      status: true,
    },
  });

  console.log(commentData.status);
  console.log(payload.status);

  if (commentData.status === payload.status) {
    throw new Error(
      `Your provided status ${payload.status} is already up to date`,
    );
  }

  const result = await prisma.comment.update({
    where: { id: commentData.id },
    data: {
      status: payload.status,
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
    where: { id: commentId, authorId },
    select: {
      id: true,
    },
  });

  // if (!comment) {
  //   throw new Error("Comment not found.");
  // }

  // if (!isAdmin && comment.authorId !== authorId) {
  //   throw new Error("You are not authorized to delete this comment.");
  // }

  await prisma.comment.delete({
    where: { id: comment.id },
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
