import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";

const createPost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await postService.createPostIntoDB(payload, id as string);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Post Created Successfully",
      data: result,
    });
  },
);

const getAllPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    console.log(query);
    const result = await postService.getAllPostsFromDB(query);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Posts Retrived Successfully",
      data: result,
    });
  },
);

const getPostById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const postId = req.params.postId;

    if (!postId) {
      throw new Error("Post Id Required In Params");
    }
    const result = await postService.getPostByIDFromDB(postId as string);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Post Retrived Successfully",
      data: result,
    });
  },
);

const getMyPosts = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;

    const result = await postService.getMyPostsFromDB(authorId as string);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "My Posts Retrived Successfully",
      data: result,
    });
  },
);

const updatePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const postId = req.params.postId;
    const payload = req.body;
    const isAdmin = req.user?.role === "ADMIN";

    const result = await postService.updatePostIntoDB(
      postId as string,
      authorId as string,
      payload,
      isAdmin,
    );
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Post updated Successfully",
      data: result,
    });
  },
);

const deletePost = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.user?.id;
    const postId = req.params.postId;
    const isAdmin = req.user?.role === "ADMIN";

    await postService.deletePostFromDB(
      postId as string,
      authorId as string,
      isAdmin,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Post deleted successfully.",
      data: null,
    });
  },
);

const getPostsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await postService.getPostsStatsFromDB();

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Dashboard statistics retrieved successfully.",
      data: result,
    });
  },
);

export const postController = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getPostsStats,
};
