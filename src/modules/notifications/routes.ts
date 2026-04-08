import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { requireModerator } from "../../middlewares/require-moderator";
import { NotificationsController } from "./controller";
import { NotificationEventsRepository } from "./repository";
import { NotificationsService } from "./service";

const notificationEventsRepository = new NotificationEventsRepository(prisma);
const notificationsService = new NotificationsService(prisma, notificationEventsRepository);
const notificationsController = new NotificationsController(notificationsService);

export const notificationsRouter = Router();

notificationsRouter.post("/process", requireAuth, requireModerator, notificationsController.processPendingEvents);
