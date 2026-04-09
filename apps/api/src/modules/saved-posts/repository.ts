import { Prisma, type PrismaClient } from "@prisma/client";

import { ConflictError } from "../../errors/conflict-error";
import { NotFoundError } from "../../errors/not-found-error";

export class SavedPostsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async ensurePostExists(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!post || post.deletedAt) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }
  }

  async savePost(postId: string, userId: string) {
    try {
      await this.prisma.savedPost.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("Post already saved by this user.");
      }

      throw error;
    }
  }

  async unsavePost(postId: string, userId: string) {
    await this.prisma.savedPost.deleteMany({
      where: {
        postId,
        userId,
      },
    });
  }

  async countSavedPosts(userId: string) {
    return this.prisma.savedPost.count({
      where: {
        userId,
      },
    });
  }

  async findSavedPosts(userId: string, page: number, limit: number) {
    return this.prisma.savedPost.findMany({
      where: {
        userId,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],
      select: {
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            status: true,
            isPinned: true,
            deletedAt: true,
            createdAt: true,
            updatedAt: true,
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                status: true,
                removedAt: true,
              },
            },
            _count: {
              select: {
                comments: {
                  where: {
                    deletedAt: null,
                  },
                },
                likes: true,
              },
            },
            likes: {
              where: {
                userId,
              },
              select: {
                id: true,
              },
              take: 1,
            },
          },
        },
      },
    });
  }
}
