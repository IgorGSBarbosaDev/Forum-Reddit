import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { listPostsQuerySchema } from "./schema";
import { PostsService } from "./service";

type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;

export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  listPosts = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = request.query as unknown as ListPostsQuery;
      const result = await this.postsService.listPosts(query, request.currentUser?.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
