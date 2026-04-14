import { Prisma, type PrismaClient } from "@prisma/client";

import { BusinessRuleError } from "../errors/business-rule-error";
import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

export class FollowsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async ensureTargetUserExists(userId: string, client: PrismaClientLike = this.prisma) {
    const user = await client.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found.", "USER_NOT_FOUND");
    }
  }

  async createFollow(currentUserId: string, targetUserId: string, client: PrismaClientLike = this.prisma) {
    if (currentUserId === targetUserId) {
      throw new BusinessRuleError("Users cannot follow themselves.", "SELF_FOLLOW_FORBIDDEN");
    }

    try {
      await client.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("User is already being followed.");
      }

      throw error;
    }
  }

  async deleteFollow(currentUserId: string, targetUserId: string, client: PrismaClientLike = this.prisma) {
    if (currentUserId === targetUserId) {
      throw new BusinessRuleError("Users cannot unfollow themselves.", "SELF_UNFOLLOW_FORBIDDEN");
    }

    await client.follow.deleteMany({
      where: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });
  }
}
