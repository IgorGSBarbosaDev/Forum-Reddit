import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { commentIdParamsSchema, postIdParamsSchema } from "../../schemas/common/id.schema";
import { ReactionsService } from "./service";

type PostIdParams = z.infer<typeof postIdParamsSchema>;
type CommentIdParams = z.infer<typeof commentIdParamsSchema>;

export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  likePost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostIdParams;
      const result = await this.reactionsService.likePost(params.postId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  unlikePost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostIdParams;
      const result = await this.reactionsService.unlikePost(params.postId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  likeComment = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as CommentIdParams;
      const result = await this.reactionsService.likeComment(params.commentId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  unlikeComment = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as CommentIdParams;
      const result = await this.reactionsService.unlikeComment(params.commentId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
