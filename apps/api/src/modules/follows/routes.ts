import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { CurrentUserGuard } from "@forum-reddit/auth";
import { FollowsRepository, FollowsService } from "@forum-reddit/core";
import { ApiRoutes } from "@forum-reddit/routes";
import { userIdParamsSchema } from "@forum-reddit/types";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { createChildRoute } from "../../routes/route-path";
import { FollowsController } from "./controller";

export function createFollowsRouter(prismaClient: PrismaClient) {
  const followsRepository = new FollowsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const followsService = new FollowsService(followsRepository, currentUserGuard);
  const followsController = new FollowsController(followsService);
  const followsRouter = Router();

  followsRouter.post(
    createChildRoute(ApiRoutes.users.root, ApiRoutes.users.follow()),
    requireAuth,
    validateParams(userIdParamsSchema),
    followsController.followUser,
  );
  followsRouter.delete(
    createChildRoute(ApiRoutes.users.root, ApiRoutes.users.follow()),
    requireAuth,
    validateParams(userIdParamsSchema),
    followsController.unfollowUser,
  );

  return followsRouter;
}

export const followsRouter = createFollowsRouter(prisma);
