import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { userIdParamsSchema } from "../../schemas/common/id.schema";
import { CurrentUserGuard } from "../users/current-user-guard";
import { FollowsController } from "./controller";
import { FollowsRepository } from "./repository";
import { FollowsService } from "./service";

export function createFollowsRouter(prismaClient: PrismaClient) {
  const followsRepository = new FollowsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const followsService = new FollowsService(followsRepository, currentUserGuard);
  const followsController = new FollowsController(followsService);
  const followsRouter = Router();

  followsRouter.post("/:userId/follow", requireAuth, validateParams(userIdParamsSchema), followsController.followUser);
  followsRouter.delete(
    "/:userId/follow",
    requireAuth,
    validateParams(userIdParamsSchema),
    followsController.unfollowUser,
  );

  return followsRouter;
}

export const followsRouter = createFollowsRouter(prisma);
