import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { RegisterUserPayload } from "./user.interface";
import { AuthorRequestStatus } from "../../../generated/prisma/enums";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto, role } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User with this email already exists");
  }
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );
  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      profile: {
        create: {
          profilePhoto,
        },
      },
      role,
    },
  });

  //   await prisma.profile.create({
  //     data: {
  //       userId: createdUser.id,
  //       profilePhoto,
  //     },
  //   });

  const user = await prisma.user.findUnique({
    where: { id: createdUser.id, email: createdUser.email },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });

  return user;
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true },
    include: { profile: true },
  });
  return user;
};

const updateMyProfileInDB = async (userId: string, payload: any) => {
  const { name, email, profilePhoto, bio } = payload;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      profile: {
        update: {
          profilePhoto,
          bio,
        },
      },
    },
    omit: { password: true },
    include: { profile: true },
  });

  return updatedUser;
};

const createAuthorRequestIntoDB = async (userId: string, bio?: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (user.role !== "USER") {
    throw new Error("You're already an author or admin.");
  }

  const existingRequest = await prisma.authorRequest.findUnique({
    where: { userId },
  });

  if (existingRequest?.status === "PENDING") {
    throw new Error("You already have a pending author request.");
  }

  // Allow re-applying after a rejection
  if (existingRequest) {
    return prisma.authorRequest.update({
      where: { userId },
      data: { bio, status: "PENDING", reviewedAt: null },
    });
  }

  return prisma.authorRequest.create({
    data: { userId, bio, status: "PENDING" },
  });
};

const getMyAuthorRequestFromDB = async (userId: string) => {
  return prisma.authorRequest.findUnique({
    where: { userId },
  });
};

const getAllAuthorRequestsFromDB = async (status?: string) => {
  const validStatus =
    status &&
    Object.values(AuthorRequestStatus).includes(status as AuthorRequestStatus)
      ? (status as AuthorRequestStatus)
      : undefined;

  const authorRequests = await prisma.authorRequest.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return authorRequests;
};

const reviewAuthorRequestInDB = async (
  requestId: string,
  status: "APPROVED" | "REJECTED",
) => {
  const existingRequest = await prisma.authorRequest.findUnique({
    where: { id: requestId },
  });

  if (!existingRequest) {
    throw new Error("Author request not found");
  }

  if (existingRequest.status !== "PENDING") {
    throw new Error("This request has already been reviewed");
  }

  const updatedRequest = await prisma.$transaction(async (tx) => {
    const request = await tx.authorRequest.update({
      where: { id: requestId },
      data: { status, reviewedAt: new Date() },
    });

    if (status === "APPROVED") {
      await tx.user.update({
        where: { id: existingRequest.userId },
        data: { role: "AUTHOR" },
      });
    }

    return request;
  });

  return updatedRequest;
};

const getAllUsersFromDB = async (filters?: {
  role?: string;
  searchTerm?: string;
}) => {
  const { role, searchTerm } = filters ?? {};

  const users = await prisma.user.findMany({
    where: {
      ...(role ? { role: role as any } : {}),
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    omit: { password: true },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return users;
};

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDB,
  updateMyProfileInDB,
  createAuthorRequestIntoDB,
  getMyAuthorRequestFromDB,
  getAllAuthorRequestsFromDB,
  reviewAuthorRequestInDB,
  getAllUsersFromDB,
};
