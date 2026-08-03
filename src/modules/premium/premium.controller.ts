import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { premiumService } from "./premium.service";
import { sendResponse } from "../../utils/sendResponse";
import HttpStatus from "http-status";

const getPremiumContent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await premiumService.getPremiumContent();

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Premium content retrived successfully",
      data: result,
    });
  },
);

export const premiumController = { getPremiumContent };
