import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { CurrentUserGuard } from "@forum-reddit/auth";
import { UsersRepository, UsersService } from "@forum-reddit/core";
import { ApiRoutes } from "@forum-reddit/routes";
import { userListQuerySchema, userProfileParamsSchema } from "@forum-reddit/types";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { createChildRoute } from "../../routes/route-path";
import { UsersController } from "./controller";

export function createUsersRouter(prismaClient: PrismaClient) {
  const usersRepository = new UsersRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const usersService = new UsersService(usersRepository, currentUserGuard);
  const usersController = new UsersController(usersService);
  const usersRouter = Router();

  usersRouter.get(
    createChildRoute(ApiRoutes.users.root, ApiRoutes.users.byId()),
    validateParams(userProfileParamsSchema),
    usersController.getProfile,
  );
  usersRouter.get(
    createChildRoute(ApiRoutes.users.root, ApiRoutes.users.followers()),
    validateParams(userProfileParamsSchema),
    validateQuery(userListQuerySchema),
    usersController.listFollowers,
  );
  usersRouter.get(
    createChildRoute(ApiRoutes.users.root, ApiRoutes.users.following()),
    validateParams(userProfileParamsSchema),
    validateQuery(userListQuerySchema),
    usersController.listFollowing,
  );
  usersRouter.get(
    createChildRoute(ApiRoutes.users.root, ApiRoutes.users.relationship()),
    requireAuth,
    validateParams(userProfileParamsSchema),
    usersController.getRelationship,
  );

  return usersRouter;
}

export const usersRouter = createUsersRouter(prisma);
