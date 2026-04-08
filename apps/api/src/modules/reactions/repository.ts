import { Prisma, type PrismaClient } from "@prisma/client";

import { ConflictError } from "../../errors/conflict-error";
import { NotFoundError } from "../../errors/not-found-error";

export class ReactionsRepository {
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

  async ensureCommentExists(commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundError("Comment not found.", "COMMENT_NOT_FOUND");
    }
  }

  async createPostLike(postId: string, userId: string) {
    try {
      await this.prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("Post already liked by this user.");
      }

      throw error;
    }
  }

  async deletePostLike(postId: string, userId: string) {
    await this.prisma.postLike.deleteMany({
      where: {
        postId,
        userId,
      },
    });
  }

  async createCommentLike(commentId: string, userId: string) {
    try {
      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ConflictError("Comment already liked by this user.");
      }

      throw error;
    }
  }

  async deleteCommentLike(commentId: string, userId: string) {
    await this.prisma.commentLike.deleteMany({
      where: {
        commentId,
        userId,
      },
    });
  }
}
