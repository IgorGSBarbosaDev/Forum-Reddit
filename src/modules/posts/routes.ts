import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { validateQuery } from "../../middlewares/validate-query";
import { listPostsQuerySchema } from "./schema";
import { PostsController } from "./controller";
import { PostsRepository } from "./repository";
import { PostsService } from "./service";

const postsRepository = new PostsRepository(prisma);
const postsService = new PostsService(postsRepository);
const postsController = new PostsController(postsService);

export const postsRouter = Router();

postsRouter.get("/", validateQuery(listPostsQuerySchema), postsController.listPosts);
