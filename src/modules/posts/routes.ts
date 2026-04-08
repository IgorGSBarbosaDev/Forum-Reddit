import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/require-auth";
import { requireModerator } from "../../middlewares/require-moderator";
import { validateBody } from "../../middlewares/validate-body";
import { validateParams } from "../../middlewares/validate-params";
import { validateQuery } from "../../middlewares/validate-query";
import { NotificationEventsRepository } from "../notifications/repository";
import { PostsController } from "./controller";
import { PostsRepository } from "./repository";
import { createPostBodySchema, listPostsQuerySchema, postDetailsParamsSchema, updatePostBodySchema, updatePostPinBodySchema, updatePostStatusBodySchema } from "./schema";
import { PostsService } from "./service";

const postsRepository = new PostsRepository(prisma);
const notificationEventsRepository = new NotificationEventsRepository(prisma);
const postsService = new PostsService(prisma, postsRepository, notificationEventsRepository);
const postsController = new PostsController(postsService);

export const postsRouter = Router();

postsRouter.get("/", validateQuery(listPostsQuerySchema), postsController.listPosts);
postsRouter.get("/:postId", validateParams(postDetailsParamsSchema), postsController.getPost);
postsRouter.post("/", requireAuth, validateBody(createPostBodySchema), postsController.createPost);
postsRouter.patch("/:postId", requireAuth, validateParams(postDetailsParamsSchema), validateBody(updatePostBodySchema), postsController.updatePost);
postsRouter.delete("/:postId", requireAuth, validateParams(postDetailsParamsSchema), postsController.deletePost);
postsRouter.patch("/:postId/status", requireAuth, requireModerator, validateParams(postDetailsParamsSchema), validateBody(updatePostStatusBodySchema), postsController.updateStatus);
postsRouter.patch("/:postId/pin", requireAuth, requireModerator, validateParams(postDetailsParamsSchema), validateBody(updatePostPinBodySchema), postsController.updatePinnedState);
