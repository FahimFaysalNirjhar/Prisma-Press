import { NextFunction, Request, RequestHandler, Response } from "express";
import HttpStatus from "http-status";

import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";

// const registerUser = async () => {
//   try {
//     const payload = req.body;

//     const user = await userService.registerUserIntoDB(payload);

//     res.status(HttpStatus.CREATED).json({
//       success: true,
//       statusCode: HttpStatus.CREATED,
//       message: "User registered successfully",
//       data: { user },
//     });
//   } catch (error) {}
// };

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const user = await userService.registerUserIntoDB(payload);

    res.status(HttpStatus.CREATED).json({
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  },
);

export const userController = { registerUser };
