import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { CurrentUserGuard } from "@forum-reddit/auth";
import { CommentsRepository, CommentsService } from "@forum-reddit/core";
import { ApiRoutes } from "@forum-reddit/routes";
import {
  commentReplyParamsSchema,
  createCommentBodySchema,
  postCommentParamsSchema,
  updateCommentBodySchema,
} from "@forum-reddit/types";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateBody } from "../../middlewares/validate-body";
import { validateParams } from "../../middlewares/validate-params";
import { CommentsController } from "./controller";

export function createCommentsRouter(prismaClient: PrismaClient) {
  const commentsRepository = new CommentsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const commentsService = new CommentsService(commentsRepository, currentUserGuard);
  const commentsController = new CommentsController(commentsService);
  const commentsRouter = Router();

  commentsRouter.post(
    ApiRoutes.posts.comments(),
    requireAuth,
    validateParams(postCommentParamsSchema),
    validateBody(createCommentBodySchema),
    commentsController.createRootComment,
  );
  commentsRouter.get(
    ApiRoutes.posts.comments(),
    validateParams(postCommentParamsSchema),
    commentsController.listComments,
  );
  commentsRouter.post(
    ApiRoutes.comments.replies(),
    requireAuth,
    validateParams(commentReplyParamsSchema),
    validateBody(createCommentBodySchema),
    commentsController.createReply,
  );
  commentsRouter.patch(
    ApiRoutes.comments.byId(),
    requireAuth,
    validateParams(commentReplyParamsSchema),
    validateBody(updateCommentBodySchema),
    commentsController.updateComment,
  );
  commentsRouter.delete(
    ApiRoutes.comments.byId(),
    requireAuth,
    validateParams(commentReplyParamsSchema),
    commentsController.deleteComment,
  );

  return commentsRouter;
}

export const commentsRouter = createCommentsRouter(prisma);
