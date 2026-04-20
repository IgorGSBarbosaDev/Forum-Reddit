import type { PrismaClient } from "@prisma/client";
import { CurrentUserGuard } from "@forum-reddit/auth";
import { ApiRoutes } from "@forum-reddit/routes";
import { Router } from "express";

import { processPendingNotificationEvents } from "@forum-reddit/jobs";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { createRequireModerator } from "../../middlewares/require-moderator";
import { createChildRoute } from "../../routes/route-path";
import { NotificationsController } from "./controller";

export function createNotificationsRouter(prismaClient: PrismaClient) {
  const notificationsController = new NotificationsController((request) =>
    processPendingNotificationEvents(prismaClient, {
      processorId: `manual-worker:${request.currentUser!.id}`,
      processedFrom: "manual-worker",
    }),
  );
  const notificationsRouter = Router();
  const requireModerator = createRequireModerator(new CurrentUserGuard(prismaClient));

  notificationsRouter.post(
    createChildRoute(ApiRoutes.notificationsAdmin.root, ApiRoutes.notificationsAdmin.process),
    requireAuth,
    requireModerator,
    notificationsController.processPendingEvents,
  );

  return notificationsRouter;
}

export const notificationsRouter = createNotificationsRouter(prisma);
