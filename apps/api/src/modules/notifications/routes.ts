import type { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { requireModerator } from "../../middlewares/require-moderator";
import { NotificationsController } from "./controller";
import { NotificationEventsRepository } from "./repository";
import { NotificationsService } from "./service";
import { CurrentUserGuard } from "../users/current-user-guard";

export function createNotificationsRouter(prismaClient: PrismaClient) {
  const notificationEventsRepository = new NotificationEventsRepository(prismaClient);
  const currentUserGuard = new CurrentUserGuard(prismaClient);
  const notificationsService = new NotificationsService(
    prismaClient,
    notificationEventsRepository,
    currentUserGuard,
  );
  const notificationsController = new NotificationsController(notificationsService);
  const notificationsRouter = Router();

  notificationsRouter.post("/process", requireAuth, requireModerator, notificationsController.processPendingEvents);

  return notificationsRouter;
}

export const notificationsRouter = createNotificationsRouter(prisma);
