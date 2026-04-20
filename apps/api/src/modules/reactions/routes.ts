import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { CurrentUserGuard } from "@forum-reddit/auth";
import { ReactionsRepository, ReactionsService } from "@forum-reddit/core";
import { ApiRoutes } from "@forum-reddit/routes";
import { commentIdParamsSchema, postIdParamsSchema } from "@forum-reddit/types";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { ReactionsController } from "./controller";

export function createReactionsRouter(prismaClient: PrismaClient) {
  const reactionsRepository = new ReactionsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const reactionsService = new ReactionsService(reactionsRepository, currentUserGuard);
  const reactionsController = new ReactionsController(reactionsService);
  const reactionsRouter = Router();

  reactionsRouter.post(
    ApiRoutes.posts.like(),
    requireAuth,
    validateParams(postIdParamsSchema),
    reactionsController.likePost,
  );
  reactionsRouter.delete(
    ApiRoutes.posts.like(),
    requireAuth,
    validateParams(postIdParamsSchema),
    reactionsController.unlikePost,
  );
  reactionsRouter.post(
    ApiRoutes.comments.like(),
    requireAuth,
    validateParams(commentIdParamsSchema),
    reactionsController.likeComment,
  );
  reactionsRouter.delete(
    ApiRoutes.comments.like(),
    requireAuth,
    validateParams(commentIdParamsSchema),
    reactionsController.unlikeComment,
  );

  return reactionsRouter;
}

export const reactionsRouter = createReactionsRouter(prisma);
