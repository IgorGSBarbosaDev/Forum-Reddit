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
import { requireModerator } from "../../middlewares/require-moderator";
import { validateBody } from "../../middlewares/validate-body";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
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

  postsRouter.get("/", validateQuery(listPostsQuerySchema), postsController.listPosts);
  postsRouter.get(
    ApiRoutes.posts.byId().replace(`${ApiRoutes.posts.root}/`, ""),
    validateParams(postDetailsParamsSchema),
    postsController.getPost,
  );
  postsRouter.post("/", requireAuth, validateBody(createPostBodySchema), postsController.createPost);
  postsRouter.patch(
    ApiRoutes.posts.byId().replace(`${ApiRoutes.posts.root}/`, ""),
    requireAuth,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostBodySchema),
    postsController.updatePost,
  );
  postsRouter.delete(
    ApiRoutes.posts.byId().replace(`${ApiRoutes.posts.root}/`, ""),
    requireAuth,
    validateParams(postDetailsParamsSchema),
    postsController.deletePost,
  );
  postsRouter.patch(
    ApiRoutes.posts.status().replace(`${ApiRoutes.posts.root}/`, ""),
    requireAuth,
    requireModerator,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostStatusBodySchema),
    postsController.updateStatus,
  );
  postsRouter.patch(
    ApiRoutes.posts.pin().replace(`${ApiRoutes.posts.root}/`, ""),
    requireAuth,
    requireModerator,
    validateParams(postDetailsParamsSchema),
    validateBody(updatePostPinBodySchema),
    postsController.updatePinnedState,
  );

  return postsRouter;
}

export const postsRouter = createPostsRouter(prisma);
