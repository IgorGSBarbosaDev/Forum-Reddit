import { UserStatus, type PrismaClient } from "@prisma/client";

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findProfile(userId: string, currentUserId?: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        status: true,
        removedAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
        followers: currentUserId
          ? {
              where: {
                followerId: currentUserId,
              },
              select: {
                id: true,
              },
              take: 1,
            }
          : false,
      },
    });
  }

  async listFollowers(userId: string, currentUserId: string | undefined, page: number, limit: number) {
    return this.prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            status: true,
            removedAt: true,
            followers: currentUserId
              ? {
                  where: {
                    followerId: currentUserId,
                  },
                  select: {
                    id: true,
                  },
                  take: 1,
                }
              : false,
          },
        },
      },
    });
  }

  async countFollowers(userId: string) {
    return this.prisma.follow.count({
      where: {
        followingId: userId,
      },
    });
  }

  async listFollowing(userId: string, currentUserId: string | undefined, page: number, limit: number) {
    return this.prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            bio: true,
            status: true,
            removedAt: true,
            followers: currentUserId
              ? {
                  where: {
                    followerId: currentUserId,
                  },
                  select: {
                    id: true,
                  },
                  take: 1,
                }
              : false,
          },
        },
      },
    });
  }

  async countFollowing(userId: string) {
    return this.prisma.follow.count({
      where: {
        followerId: userId,
      },
    });
  }

  async findRelationship(targetUserId: string, currentUserId: string) {
    return this.prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
      select: {
        id: true,
      },
    });
  }

  async removeUser(userId: string) {
    return this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          status: UserStatus.REMOVED,
          removedAt: new Date(),
          bio: null,
        },
      }),
      this.prisma.post.updateMany({
        where: {
          authorId: userId,
        },
        data: {
          authorId: null,
        },
      }),
      this.prisma.comment.updateMany({
        where: {
          authorId: userId,
        },
        data: {
          authorId: null,
        },
      }),
    ]);
  }
}
