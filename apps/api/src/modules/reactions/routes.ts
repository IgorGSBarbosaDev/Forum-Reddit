import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { commentIdParamsSchema, postIdParamsSchema } from "../../schemas/common/id.schema";
import { CurrentUserGuard } from "../users/current-user-guard";
import { ReactionsController } from "./controller";
import { ReactionsRepository } from "./repository";
import { ReactionsService } from "./service";

export function createReactionsRouter(prismaClient: PrismaClient) {
  const reactionsRepository = new ReactionsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const reactionsService = new ReactionsService(reactionsRepository, currentUserGuard);
  const reactionsController = new ReactionsController(reactionsService);
  const reactionsRouter = Router();

  reactionsRouter.post("/posts/:postId/like", requireAuth, validateParams(postIdParamsSchema), reactionsController.likePost);
  reactionsRouter.delete(
    "/posts/:postId/like",
    requireAuth,
    validateParams(postIdParamsSchema),
    reactionsController.unlikePost,
  );
  reactionsRouter.post(
    "/comments/:commentId/like",
    requireAuth,
    validateParams(commentIdParamsSchema),
    reactionsController.likeComment,
  );
  reactionsRouter.delete(
    "/comments/:commentId/like",
    requireAuth,
    validateParams(commentIdParamsSchema),
    reactionsController.unlikeComment,
  );

  return reactionsRouter;
}

export const reactionsRouter = createReactionsRouter(prisma);
