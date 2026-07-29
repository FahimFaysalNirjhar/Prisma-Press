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
      message: "Post created successfully",
      data: result,
    });
  },
);

export const postController = { createPost };
