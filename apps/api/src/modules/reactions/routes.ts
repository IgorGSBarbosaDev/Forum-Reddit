import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { commentIdParamsSchema, postIdParamsSchema } from "../../schemas/common/id.schema";
import { ReactionsController } from "./controller";
import { ReactionsRepository } from "./repository";
import { ReactionsService } from "./service";

const reactionsRepository = new ReactionsRepository(prisma);
const reactionsService = new ReactionsService(reactionsRepository);
const reactionsController = new ReactionsController(reactionsService);

export const reactionsRouter = Router();

reactionsRouter.post("/posts/:postId/like", requireAuth, validateParams(postIdParamsSchema), reactionsController.likePost);
reactionsRouter.delete("/posts/:postId/like", requireAuth, validateParams(postIdParamsSchema), reactionsController.unlikePost);
reactionsRouter.post("/comments/:commentId/like", requireAuth, validateParams(commentIdParamsSchema), reactionsController.likeComment);
reactionsRouter.delete("/comments/:commentId/like", requireAuth, validateParams(commentIdParamsSchema), reactionsController.unlikeComment);
