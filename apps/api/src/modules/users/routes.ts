import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { UsersController } from "./controller";
import { CurrentUserGuard } from "./current-user-guard";
import { userListQuerySchema, userProfileParamsSchema } from "./schema";
import { UsersRepository } from "./repository";
import { UsersService } from "./service";

export function createUsersRouter(prismaClient: PrismaClient) {
  const usersRepository = new UsersRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const usersService = new UsersService(usersRepository, currentUserGuard);
  const usersController = new UsersController(usersService);
  const usersRouter = Router();

  usersRouter.get("/:userId", validateParams(userProfileParamsSchema), usersController.getProfile);
  usersRouter.get(
    "/:userId/followers",
    validateParams(userProfileParamsSchema),
    validateQuery(userListQuerySchema),
    usersController.listFollowers,
  );
  usersRouter.get(
    "/:userId/following",
    validateParams(userProfileParamsSchema),
    validateQuery(userListQuerySchema),
    usersController.listFollowing,
  );
  usersRouter.get(
    "/:userId/relationship",
    requireAuth,
    validateParams(userProfileParamsSchema),
    usersController.getRelationship,
  );

  return usersRouter;
}

export const usersRouter = createUsersRouter(prisma);
