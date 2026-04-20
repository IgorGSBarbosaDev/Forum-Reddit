import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { CurrentUserGuard } from "@forum-reddit/auth";
import {
  NotificationEventsRepository,
  PostsRepository,
  PostsService,
} from "@forum-reddit/core";
import { ApiRoutes } from "@forum-reddit/routes";
import {
  createPostBodySchema,
  listPostsQuerySchema,
  postDetailsParamsSchema,
  updatePostBodySchema,
  updatePostPinBodySchema,
  updatePostStatusBodySchema,
} from "@forum-reddit/types";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { createRequireModerator } from "../../middlewares/require-moderator";
import { validateBody } from "../../middlewares/validate-body";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { createChildRoute } from "../../routes/route-path";
import { PostsController } from "./controller";

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
  const requireModerator = createRequireModerator(currentUserGuard);

  postsRouter.get("/", validateQuery(listPostsQuerySchema), postsController.listPosts);
  postsRouter.get(
    createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.byId()),
    validateParams(postDetailsParamsSchema),
    postsController.getPost,
  );
  postsRouter.post("/", requireAuth, validateBody(createPostBodySchema), postsController.createPost);
  postsRouter.patch(
    createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.byId()),
    requireAuth,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostBodySchema),
    postsController.updatePost,
  );
  postsRouter.delete(
    createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.byId()),
    requireAuth,
    validateParams(postDetailsParamsSchema),
    postsController.deletePost,
  );
  postsRouter.patch(
    createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.status()),
    requireAuth,
    requireModerator,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostStatusBodySchema),
    postsController.updateStatus,
  );
  postsRouter.patch(
    createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.pin()),
    requireAuth,
    requireModerator,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostPinBodySchema),
    postsController.updatePinnedState,
  );

  return postsRouter;
}

export const postsRouter = createPostsRouter(prisma);
