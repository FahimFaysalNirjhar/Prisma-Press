import { title } from "node:process";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { ICreatePost, IPostQuery, IUpdatePostPayload } from "./post.interface";
import { PostWhereInput } from "../../../generated/prisma/models";

const createPostIntoDB = async (payload: ICreatePost, userId: string) => {
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPostsFromDB = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";
  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];

  const andConditions: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: query.searchTerm, mode: "insensitive" } },
        {
          content: { contains: query.searchTerm, mode: "insensitive" },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      title: query.title,
    });
  }

  if (query.content) {
    andConditions.push({
      content: query.content,
    });
  }

  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }

  if (query.isFeatured) {
    andConditions.push({
      isFeatured: Boolean(query.isFeatured),
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  if (query.tags) {
    andConditions.push({ tags: { hasSome: tagsArray } });
  }

  const posts = await prisma.post.findMany({
    // where: {
    //   AND: [
    //     query.searchTerm
    //       ? {
    //           OR: [
    //             { title: { contains: query.searchTerm, mode: "insensitive" } },
    //             {
    //               content: { contains: query.searchTerm, mode: "insensitive" },
    //             },
    //           ],
    //         }
    //       : {},

    //     query.title ? { title: query.title } : {},
    //     query.content ? { content: query.content } : {},
    //   ],
    // },
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: { [sortBy]: sortOrder },
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
  // const post = await prisma.post.findUniqueOrThrow({
  //   where: { id: postId },
  // });

  // const updatedPost = await prisma.post.update({
  //   where: { id: postId },
  //   data: {
  //     views: { increment: 1 },
  //   },
  //   include: {
  //     author: {
  //       omit: { password: true },
  //     },
  //     comments: true,
  //   },
  // });

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
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

    // throw new Error("Fake Error");

    const post = await tx.post.findUniqueOrThrow({
      where: { id: postId },
    });

    return post;
  });

  return transactionResult;
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

const deletePostFromDB = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not the owner of this post");
  }

  await prisma.post.delete({ where: { id: postId } });
};

const getPostsStatsFromDB = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // const totalPost = await tx.post.count();
    // const totalPublishedPost = await tx.post.count({
    //   where: { status: PostStatus.PUBLISHED },
    // });
    // const totalDraftPost = await tx.post.count({
    //   where: { status: PostStatus.DRAFT },
    // });
    // const totalArchivedPost = await tx.post.count({
    //   where: { status: PostStatus.ARCHIVED },
    // });
    // const totalComments = await tx.comment.count();
    // const totalApprovedComments = await tx.comment.count({
    //   where: { status: CommentStatus.APPROVED },
    // });
    // const totalRejectComments = await tx.comment.count({
    //   where: { status: CommentStatus.REJECT },
    // });

    // const totalPostViews = await tx.post.aggregate({ _sum: { views: true } });

    const [
      totalPost,
      totalPublishedPost,
      totalDraftPost,
      totalArchivedPost,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViewsAggeregate,
    ] = await Promise.all([
      tx.post.count(),

      tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),

      tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),

      tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),

      tx.comment.count(),

      tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),

      tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),

      tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);

    return {
      totalPost,
      totalPublishedPost,
      totalDraftPost,
      totalArchivedPost,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostViewsAggeregate._sum.views,
    };
  });

  return transactionResult;
};

export const postService = {
  createPostIntoDB,
  getAllPostsFromDB,
  getPostByIDFromDB,
  getMyPostsFromDB,
  updatePostIntoDB,
  deletePostFromDB,
  getPostsStatsFromDB,
};
