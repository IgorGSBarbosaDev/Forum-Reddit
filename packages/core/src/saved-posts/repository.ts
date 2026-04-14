import { Prisma, type PrismaClient } from "@prisma/client";
import { activeCommentWhere, activePostWhere } from "@forum-reddit/database";

import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

export class SavedPostsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async ensurePostExists(postId: string, client: PrismaClientLike = this.prisma) {
    const post = await client.post.findFirst({
      where: activePostWhere({
        id: postId,
      }),
      select: {
        id: true,
      },
    });

    if (!post) {
      throw new NotFoundError("Post not found.", "POST_NOT_FOUND");
    }
  }

  async savePost(postId: string, userId: string, client: PrismaClientLike = this.prisma) {
    try {
      await client.savedPost.create({
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

  async unsavePost(postId: string, userId: string, client: PrismaClientLike = this.prisma) {
    await client.savedPost.deleteMany({
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
        post: activePostWhere(),
      },
    });
  }

  async findSavedPosts(userId: string, page: number, limit: number) {
    return this.prisma.savedPost.findMany({
      where: {
        userId,
        post: activePostWhere(),
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
                  where: activeCommentWhere(),
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
