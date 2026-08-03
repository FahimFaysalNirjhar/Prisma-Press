import { prisma } from "../../lib/prisma";

const getPremiumContent = async () => {
  const posts = await prisma.post.findMany({
    where: { isPermium: true },
  });
  return posts;
};

export const premiumService = { getPremiumContent };
