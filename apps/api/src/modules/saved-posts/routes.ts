import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { SavedPostsController } from "./controller";
import { SavedPostsRepository } from "./repository";
import { listSavedPostsQuerySchema, savedPostParamsSchema } from "./schema";
import { SavedPostsService } from "./service";

const savedPostsRepository = new SavedPostsRepository(prisma);
const savedPostsService = new SavedPostsService(savedPostsRepository);
const savedPostsController = new SavedPostsController(savedPostsService);

export const savedPostsRouter = Router();

savedPostsRouter.post("/posts/:postId/save", requireAuth, validateParams(savedPostParamsSchema), savedPostsController.savePost);
savedPostsRouter.delete("/posts/:postId/save", requireAuth, validateParams(savedPostParamsSchema), savedPostsController.unsavePost);
savedPostsRouter.get("/me/saved-posts", requireAuth, validateQuery(listSavedPostsQuerySchema), savedPostsController.listSavedPosts);
