import { NextFunction, Request, RequestHandler, Response } from "express";
import HttpStatus from "http-status";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

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

    // res.status(HttpStatus.CREATED).json({
    //
    //
    //
    //  ,
    // });

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "User registered successfully",
      data: { user },
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const cookies = req.cookies;

    // const { accessToken } = cookies;
    // const verifiedToken = jwt.verify(accessToken, config.jwt_access_secret);
    //

    // const verifiedToken = jwtUtils.verifyToken(
    //   accessToken,
    //   config.jwt_access_secret,
    // );

    // if (typeof verifiedToken === "string") {
    //   throw new Error(verifiedToken);
    // }

    const profile = await userService.getMyProfileFromDB(
      req.user?.id as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "User Profile fetched successfully",
      data: { profile },
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const payload = req.body;

    const updatedProfile = await userService.updateMyProfileInDB(
      userId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "User Profile updated successfully",
      data: { updatedProfile },
    });
  },
);

const createAuthorRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const { bio } = req.body;

    const authorRequest = await userService.createAuthorRequestIntoDB(
      userId,
      bio,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: "Author request submitted successfully",
      data: { authorRequest },
    });
  },
);

const getMyAuthorRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;

    const authorRequest = await userService.getMyAuthorRequestFromDB(userId);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Author request fetched successfully",
      data: { authorRequest },
    });
  },
);

const getAllAuthorRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;

    const authorRequests = await userService.getAllAuthorRequestsFromDB(
      status as string | undefined,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: "Author requests fetched successfully",
      data: { authorRequests },
    });
  },
);

const reviewAuthorRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body; // "APPROVED" | "REJECTED"

    const authorRequest = await userService.reviewAuthorRequestInDB(
      id as string,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: HttpStatus.OK,
      message: `Author request ${status.toLowerCase()} successfully`,
      data: { authorRequest },
    });
  },
);

export const userController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
  createAuthorRequest,
  getMyAuthorRequest,
  getAllAuthorRequests,
  reviewAuthorRequest,
};
