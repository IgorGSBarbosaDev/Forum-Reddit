import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { UsersController } from "./controller";
import { userListQuerySchema, userProfileParamsSchema } from "./schema";
import { UsersRepository } from "./repository";
import { UsersService } from "./service";

const usersRepository = new UsersRepository(prisma);
const usersService = new UsersService(usersRepository);
const usersController = new UsersController(usersService);

export const usersRouter = Router();

usersRouter.get("/:userId", validateParams(userProfileParamsSchema), usersController.getProfile);
usersRouter.get("/:userId/followers", validateParams(userProfileParamsSchema), validateQuery(userListQuerySchema), usersController.listFollowers);
usersRouter.get("/:userId/following", validateParams(userProfileParamsSchema), validateQuery(userListQuerySchema), usersController.listFollowing);
usersRouter.get("/:userId/relationship", requireAuth, validateParams(userProfileParamsSchema), usersController.getRelationship);
