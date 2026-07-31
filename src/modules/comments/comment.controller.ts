import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import HttpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";

const createComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const authorId = req.user?.id;

    const result = await commentService.createCommentIntoDB(
      payload,
      authorId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Comment created successfully.",
      data: result,
    });
  },
);

const getCommentByAuthorId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const authorId = req.params.authorId;

    const result = await commentService.getCommentByAuthorIdFromDB(
      authorId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "My comments retrieved successfully.",
      data: result,
    });
  },
);

const getCommentByCommentId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;

    const result = await commentService.getCommentByIdFromDB(
      commentId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment retrieved successfully.",
      data: result,
    });
  },
);

const updateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const authorId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN";
    const payload = req.body;

    const result = await commentService.updateCommentIntoDB(
      commentId as string,
      authorId as string,
      isAdmin,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment updated successfully.",
      data: result,
    });
  },
);

const moderateComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const commentId = req.params.commentId;
    const payload = req.body;

    console.log(req.user?.role);

    const result = await commentService.moderateCommentIntoDB(
      payload,
      commentId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Comment moderated successfully.",
      data: result,
    });
  },
);

export const commentController = {
  createComment,
  getCommentByAuthorId,
  getCommentByCommentId,
  updateComment,
  moderateComment,
};
