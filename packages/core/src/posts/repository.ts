import type { Prisma, PrismaClient } from "@prisma/client";
import { PostStatus } from "@prisma/client";
import { activeCommentWhere, activePostWhere } from "@forum-reddit/database";

import { FEED_VISIBLE_POST_STATUSES, REMOVED_POST_TITLE } from "../forum";
import type { ListPostsQuery, UpdatePostInput } from "./types";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

function buildPostSelect(currentUserId?: string) {
  return {
    id: true,
    title: true,
    content: true,
    status: true,
    isPinned: true,
    wasEdited: true,
    editCount: true,
    lastEditedAt: true,
    deletedAt: true,
    createdAt: true,
    updatedAt: true,
    authorId: true,
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
  } satisfies Prisma.PostSelect;
}

export class PostsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countFeedPosts() {
    return this.prisma.post.count({
      where: this.buildFeedWhere(),
    });
  }

  async findFeedPosts(query: ListPostsQuery, currentUserId?: string) {
    return this.prisma.post.findMany({
      where: this.buildFeedWhere(),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: this.buildFeedOrderBy(query),
      select: buildPostSelect(currentUserId),
    });
  }

  async findPostById(postId: string, currentUserId?: string) {
    return this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: buildPostSelect(currentUserId),
    });
  }

  async findPostStateById(postId: string) {
    return this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        authorId: true,
        status: true,
        deletedAt: true,
      },
    });
  }

  async createPost(
    data: {
      authorId: string;
      title: string;
      content: string | null;
    },
    client: PrismaClientLike = this.prisma,
  ) {
    return client.post.create({
      data,
      select: {
        id: true,
      },
    });
  }

  async updatePostContent(postId: string, input: UpdatePostInput, client: PrismaClientLike = this.prisma) {
    return client.post.update({
      where: {
        id: postId,
      },
      data: {
        title: input.title,
        content: input.content,
        wasEdited: true,
        editCount: {
          increment: 1,
        },
        lastEditedAt: new Date(),
      },
    });
  }

  async markPostDeleted(postId: string, client: PrismaClientLike = this.prisma) {
    return client.post.update({
      where: {
        id: postId,
      },
      data: {
        title: REMOVED_POST_TITLE,
        content: null,
        authorId: null,
        deletedAt: new Date(),
      },
    });
  }

  async updatePostStatus(postId: string, status: PostStatus) {
    return this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        status,
      },
    });
  }

  async updatePinnedState(postId: string, isPinned: boolean) {
    return this.prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        isPinned,
      },
    });
  }

  private buildFeedWhere(): Prisma.PostWhereInput {
    return activePostWhere({
      status: {
        in: FEED_VISIBLE_POST_STATUSES,
      },
    });
  }

  private buildFeedOrderBy(query: ListPostsQuery): Prisma.PostOrderByWithRelationInput[] {
    const sortBy = query.sortBy ?? "createdAt";
    const order = query.order ?? "desc";

    return [
      { isPinned: "desc" },
      { [sortBy]: order },
      { id: order },
    ];
  }
}
