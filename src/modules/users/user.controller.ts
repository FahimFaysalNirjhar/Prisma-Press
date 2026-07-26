import { Request, Response } from "express";
import HttpStatus from "http-status";

import { userService } from "./user.service";

const registerUser = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const user = await userService.registerUserIntoDB(payload);

    res.status(HttpStatus.CREATED).json({
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: true,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Faild to register user",
      error: (error as Error).message,
    });
  }
};
export const userController = { registerUser };
