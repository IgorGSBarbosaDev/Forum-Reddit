import type { PrismaClient } from "@prisma/client";
import { CurrentUserGuard } from "@forum-reddit/auth";
import { ApiRoutes } from "@forum-reddit/routes";
import { Router } from "express";

import { prisma } from "../lib/prisma";
import { requireAuth } from "../middlewares/require-auth";
import { createCommentsRouter } from "../modules/comments/routes";
import { createFollowsRouter } from "../modules/follows/routes";
import { createNotificationsRouter } from "../modules/notifications/routes";
import { createPostsRouter } from "../modules/posts/routes";
import { createReactionsRouter } from "../modules/reactions/routes";
import { createSavedPostsRouter } from "../modules/saved-posts/routes";
import { createUsersRouter } from "../modules/users/routes";

export function createRouter(prismaClient: PrismaClient) {
  const router = Router();
  const currentUserGuard = new CurrentUserGuard(prismaClient);

  router.use(ApiRoutes.posts.root, createPostsRouter(prismaClient));
  router.use("/", createCommentsRouter(prismaClient));
  router.use("/", createReactionsRouter(prismaClient));
  router.use("/", createSavedPostsRouter(prismaClient));
  router.use(ApiRoutes.users.root, createUsersRouter(prismaClient));
  router.use(ApiRoutes.users.root, createFollowsRouter(prismaClient));
  router.use(ApiRoutes.notificationsAdmin.root, createNotificationsRouter(prismaClient));

  router.get(ApiRoutes.health, (_request, response) => {
    response.status(200).json({
      status: "ok",
      service: "forum-reddit-api",
    });
  });

  router.get(ApiRoutes.me, requireAuth, async (request, response, next) => {
    try {
      await currentUserGuard.assertActiveUser(request.currentUser!.id);

      response.status(200).json({
        currentUserId: request.currentUser!.id,
        role: request.currentUser!.role,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export const router = createRouter(prisma);
