import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { userIdParamsSchema } from "../../schemas/common/id.schema";
import { FollowsController } from "./controller";
import { FollowsRepository } from "./repository";
import { FollowsService } from "./service";

const followsRepository = new FollowsRepository(prisma);
const followsService = new FollowsService(followsRepository);
const followsController = new FollowsController(followsService);

export const followsRouter = Router();

followsRouter.post("/:userId/follow", requireAuth, validateParams(userIdParamsSchema), followsController.followUser);
followsRouter.delete("/:userId/follow", requireAuth, validateParams(userIdParamsSchema), followsController.unfollowUser);
