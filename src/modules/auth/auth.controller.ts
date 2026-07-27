import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const loginResult = await authService.loginUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      data: loginResult,
      message: "User logged in successfully",
    });
  },
);

export const authController = { loginUser };
