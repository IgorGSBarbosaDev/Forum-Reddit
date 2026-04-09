import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { CurrentUserGuard } from "../users/current-user-guard";
import { SavedPostsController } from "./controller";
import { SavedPostsRepository } from "./repository";
import { listSavedPostsQuerySchema, savedPostParamsSchema } from "./schema";
import { SavedPostsService } from "./service";

export function createSavedPostsRouter(prismaClient: PrismaClient) {
  const savedPostsRepository = new SavedPostsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const savedPostsService = new SavedPostsService(savedPostsRepository, currentUserGuard);
  const savedPostsController = new SavedPostsController(savedPostsService);
  const savedPostsRouter = Router();

  savedPostsRouter.post(
    "/posts/:postId/save",
    requireAuth,
    validateParams(savedPostParamsSchema),
    savedPostsController.savePost,
  );
  savedPostsRouter.delete(
    "/posts/:postId/save",
    requireAuth,
    validateParams(savedPostParamsSchema),
    savedPostsController.unsavePost,
  );
  savedPostsRouter.get(
    "/me/saved-posts",
    requireAuth,
    validateQuery(listSavedPostsQuerySchema),
    savedPostsController.listSavedPosts,
  );

  return savedPostsRouter;
}

export const savedPostsRouter = createSavedPostsRouter(prisma);
