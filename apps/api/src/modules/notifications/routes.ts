import type { PrismaClient } from "@prisma/client";
import { ApiRoutes } from "@forum-reddit/routes";
import { Router } from "express";

import { processPendingNotificationEvents } from "@forum-reddit/jobs";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { requireModerator } from "../../middlewares/require-moderator";
import { NotificationsController } from "./controller";

export function createNotificationsRouter(prismaClient: PrismaClient) {
  const notificationsController = new NotificationsController((request) =>
    processPendingNotificationEvents(prismaClient, {
      processorId: `manual-worker:${request.currentUser!.id}`,
      processedFrom: "manual-worker",
    }),
  );
  const notificationsRouter = Router();

  notificationsRouter.post(
    ApiRoutes.notificationsAdmin.process.replace(ApiRoutes.notificationsAdmin.root, ""),
    requireAuth,
    requireModerator,
    notificationsController.processPendingEvents,
  );

  return notificationsRouter;
}

export const notificationsRouter = createNotificationsRouter(prisma);
