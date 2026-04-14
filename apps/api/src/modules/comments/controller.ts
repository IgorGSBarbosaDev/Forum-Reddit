import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { CommentsService } from "@forum-reddit/core";
import {
  commentReplyParamsSchema,
  createCommentBodySchema,
  postCommentParamsSchema,
  updateCommentBodySchema,
} from "@forum-reddit/types";

type PostCommentParams = z.infer<typeof postCommentParamsSchema>;
type CommentReplyParams = z.infer<typeof commentReplyParamsSchema>;
type CreateCommentBody = z.infer<typeof createCommentBodySchema>;
type UpdateCommentBody = z.infer<typeof updateCommentBodySchema>;

export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  createRootComment = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostCommentParams;
      const body = request.body as CreateCommentBody;
      const result = await this.commentsService.createRootComment(params.postId, body, request.currentUser!.id);

      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  listComments = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostCommentParams;
      const result = await this.commentsService.listComments(params.postId, request.currentUser?.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createReply = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as CommentReplyParams;
      const body = request.body as CreateCommentBody;
      const result = await this.commentsService.createReply(params.commentId, body, request.currentUser!.id);

      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateComment = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as CommentReplyParams;
      const body = request.body as UpdateCommentBody;
      const result = await this.commentsService.updateComment(params.commentId, body, request.currentUser!.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as CommentReplyParams;
      const result = await this.commentsService.deleteComment(params.commentId, request.currentUser!.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
