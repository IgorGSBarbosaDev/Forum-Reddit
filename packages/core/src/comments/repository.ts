import type { Prisma, PrismaClient } from "@prisma/client";

import { REMOVED_COMMENT_CONTENT } from "../forum";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

export class CommentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPostState(postId: string) {
    return this.prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        id: true,
        status: true,
        deletedAt: true,
      },
    });
  }

  async findCommentState(commentId: string) {
    return this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        postId: true,
        parentId: true,
        authorId: true,
        depth: true,
        deletedAt: true,
      },
    });
  }

  async createComment(data: {
    postId: string;
    authorId: string;
    parentId?: string | null;
    content: string;
    depth: number;
  }, client: PrismaClientLike = this.prisma) {
    return client.comment.create({
      data,
      select: {
        id: true,
      },
    });
  }

  async updateComment(commentId: string, content: string, client: PrismaClientLike = this.prisma) {
    return client.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content,
        wasEdited: true,
        editCount: {
          increment: 1,
        },
        lastEditedAt: new Date(),
      },
    });
  }

  async markCommentDeleted(commentId: string, client: PrismaClientLike = this.prisma) {
    return client.comment.update({
      where: {
        id: commentId,
      },
      data: {
        content: REMOVED_COMMENT_CONTENT,
        authorId: null,
        deletedAt: new Date(),
      },
    });
  }

  async findCommentById(commentId: string, currentUserId?: string) {
    return this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: this.buildCommentSelect(currentUserId),
    });
  }

  async findCommentsByPostId(postId: string, currentUserId?: string) {
    return this.prisma.comment.findMany({
      where: {
        postId,
      },
      orderBy: [
        { createdAt: "asc" },
        { id: "asc" },
      ],
      select: this.buildCommentSelect(currentUserId),
    });
  }

  private buildCommentSelect(currentUserId?: string) {
    return {
      id: true,
      postId: true,
      parentId: true,
      depth: true,
      content: true,
      wasEdited: true,
      editCount: true,
      lastEditedAt: true,
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
    } satisfies Prisma.CommentSelect;
  }
}
