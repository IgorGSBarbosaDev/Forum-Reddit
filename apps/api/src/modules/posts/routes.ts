import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { requireModerator } from "../../middlewares/require-moderator";
import { validateBody } from "../../middlewares/validate-body";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { NotificationEventsRepository } from "../notifications/repository";
import { CurrentUserGuard } from "../users/current-user-guard";
import { PostsController } from "./controller";
import { PostsRepository } from "./repository";
import { createPostBodySchema, listPostsQuerySchema, postDetailsParamsSchema, updatePostBodySchema, updatePostPinBodySchema, updatePostStatusBodySchema } from "./schema";
import { PostsService } from "./service";

export function createPostsRouter(prismaClient: PrismaClient) {
  const postsRepository = new PostsRepository(prismaClient);
  const notificationEventsRepository = new NotificationEventsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const postsService = new PostsService(
    prismaClient,
    postsRepository,
    notificationEventsRepository,
    currentUserGuard,
  );
  const postsController = new PostsController(postsService);
  const postsRouter = Router();

  postsRouter.get("/", validateQuery(listPostsQuerySchema), postsController.listPosts);
  postsRouter.get("/:postId", validateParams(postDetailsParamsSchema), postsController.getPost);
  postsRouter.post("/", requireAuth, validateBody(createPostBodySchema), postsController.createPost);
  postsRouter.patch(
    "/:postId",
    requireAuth,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostBodySchema),
    postsController.updatePost,
  );
  postsRouter.delete("/:postId", requireAuth, validateParams(postDetailsParamsSchema), postsController.deletePost);
  postsRouter.patch(
    "/:postId/status",
    requireAuth,
    requireModerator,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostStatusBodySchema),
    postsController.updateStatus,
  );
  postsRouter.patch(
    "/:postId/pin",
    requireAuth,
    requireModerator,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostPinBodySchema),
    postsController.updatePinnedState,
  );

  return postsRouter;
}

export const postsRouter = createPostsRouter(prisma);
