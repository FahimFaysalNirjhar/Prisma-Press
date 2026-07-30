import { prisma } from "../../lib/prisma";
import { ICreateComment } from "./comment.interface";

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

export const commentService = { createCommentIntoDB };
