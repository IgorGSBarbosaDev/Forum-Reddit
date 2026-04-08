import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { listSavedPostsQuerySchema, savedPostParamsSchema } from "./schema";
import { SavedPostsService } from "./service";

type SavedPostParams = z.infer<typeof savedPostParamsSchema>;
type ListSavedPostsQuery = z.infer<typeof listSavedPostsQuerySchema>;

export class SavedPostsController {
  constructor(private readonly savedPostsService: SavedPostsService) {}

  savePost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as SavedPostParams;
      const result = await this.savedPostsService.savePost(params.postId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  unsavePost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as SavedPostParams;
      const result = await this.savedPostsService.unsavePost(params.postId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listSavedPosts = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const query = request.query as unknown as ListSavedPostsQuery;
      const result = await this.savedPostsService.listSavedPosts(request.currentUser!.id, query.page, query.limit);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
