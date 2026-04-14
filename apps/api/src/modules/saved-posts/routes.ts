import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { CurrentUserGuard } from "@forum-reddit/auth";
import { SavedPostsRepository, SavedPostsService } from "@forum-reddit/core";
import { ApiRoutes } from "@forum-reddit/routes";
import { listSavedPostsQuerySchema, savedPostParamsSchema } from "@forum-reddit/types";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { SavedPostsController } from "./controller";

export function createSavedPostsRouter(prismaClient: PrismaClient) {
  const savedPostsRepository = new SavedPostsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const savedPostsService = new SavedPostsService(savedPostsRepository, currentUserGuard);
  const savedPostsController = new SavedPostsController(savedPostsService);
  const savedPostsRouter = Router();

  savedPostsRouter.post(
    ApiRoutes.posts.save().replace(/^\//, ""),
    requireAuth,
    validateParams(savedPostParamsSchema),
    savedPostsController.savePost,
  );
  savedPostsRouter.delete(
    ApiRoutes.posts.save().replace(/^\//, ""),
    requireAuth,
    validateParams(savedPostParamsSchema),
    savedPostsController.unsavePost,
  );
  savedPostsRouter.get(
    ApiRoutes.savedPosts.mine,
    requireAuth,
    validateQuery(listSavedPostsQuerySchema),
    savedPostsController.listSavedPosts,
  );

  return savedPostsRouter;
}

export const savedPostsRouter = createSavedPostsRouter(prisma);
