import type { Prisma, PrismaClient } from "@prisma/client";
import { PostStatus } from "@prisma/client";

import type { ListPostsQuery } from "./types";

const FEED_VISIBLE_STATUSES: PostStatus[] = [PostStatus.ACTIVE, PostStatus.BLOCKED];

export class PostsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countFeedPosts() {
    return this.prisma.post.count({
      where: {
        deletedAt: null,
        status: {
          in: FEED_VISIBLE_STATUSES,
        },
      },
    });
  }

  async findFeedPosts(query: ListPostsQuery, currentUserId?: string) {
    return this.prisma.post.findMany({
      where: {
        deletedAt: null,
        status: {
          in: FEED_VISIBLE_STATUSES,
        },
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: this.buildFeedOrderBy(query),
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        isPinned: true,
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
        likes: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
              take: 1,
            }
          : false,
        saves: currentUserId
          ? {
              where: {
                userId: currentUserId,
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

  private buildFeedOrderBy(query: ListPostsQuery): Prisma.PostOrderByWithRelationInput[] {
    const sortBy = query.sortBy ?? "createdAt";
    const order = query.order ?? "desc";

    return [
      { isPinned: "desc" },
      { [sortBy]: order },
    ];
  }
}
