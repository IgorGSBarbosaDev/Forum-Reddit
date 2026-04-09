import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateBody } from "../../middlewares/validate-body";
import { validateParams } from "../../middlewares/validate-params";
import { CurrentUserGuard } from "../users/current-user-guard";
import { CommentsController } from "./controller";
import { CommentsRepository } from "./repository";
import { commentReplyParamsSchema, createCommentBodySchema, postCommentParamsSchema, updateCommentBodySchema } from "./schema";
import { CommentsService } from "./service";

export function createCommentsRouter(prismaClient: PrismaClient) {
  const commentsRepository = new CommentsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const commentsService = new CommentsService(commentsRepository, currentUserGuard);
  const commentsController = new CommentsController(commentsService);
  const commentsRouter = Router();

  commentsRouter.post(
    "/posts/:postId/comments",
    requireAuth,
    validateParams(postCommentParamsSchema),
    validateBody(createCommentBodySchema),
    commentsController.createRootComment,
  );
  commentsRouter.get("/posts/:postId/comments", validateParams(postCommentParamsSchema), commentsController.listComments);
  commentsRouter.post(
    "/comments/:commentId/replies",
    requireAuth,
    validateParams(commentReplyParamsSchema),
    validateBody(createCommentBodySchema),
    commentsController.createReply,
  );
  commentsRouter.patch(
    "/comments/:commentId",
    requireAuth,
    validateParams(commentReplyParamsSchema),
    validateBody(updateCommentBodySchema),
    commentsController.updateComment,
  );
  commentsRouter.delete(
    "/comments/:commentId",
    requireAuth,
    validateParams(commentReplyParamsSchema),
    commentsController.deleteComment,
  );

  return commentsRouter;
}

export const commentsRouter = createCommentsRouter(prisma);
