import { Prisma, type PrismaClient } from "@prisma/client";
import { activeCommentWhere, activePostWhere } from "@forum-reddit/database";

import { ConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found-error";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

export class ReactionsRepository {
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

  async ensureCommentExists(commentId: string, client: PrismaClientLike = this.prisma) {
    const comment = await client.comment.findFirst({
      where: activeCommentWhere({
        id: commentId,
      }),
      select: {
        id: true,
      },
    });

    if (!comment) {
      throw new NotFoundError("Comment not found.", "COMMENT_NOT_FOUND");
    }
  }

  async createPostLike(postId: string, userId: string, client: PrismaClientLike = this.prisma) {
    try {
      await client.postLike.create({
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

  async deletePostLike(postId: string, userId: string, client: PrismaClientLike = this.prisma) {
    await client.postLike.deleteMany({
      where: {
        postId,
        userId,
      },
    });
  }

  async createCommentLike(commentId: string, userId: string, client: PrismaClientLike = this.prisma) {
    try {
      await client.commentLike.create({
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

  async deleteCommentLike(commentId: string, userId: string, client: PrismaClientLike = this.prisma) {
    await client.commentLike.deleteMany({
      where: {
        commentId,
        userId,
      },
    });
  }
}
