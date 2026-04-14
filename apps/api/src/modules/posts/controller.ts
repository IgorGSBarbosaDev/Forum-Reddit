import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { PostsService } from "@forum-reddit/core";
import {
  createPostBodySchema,
  listPostsQuerySchema,
  postDetailsParamsSchema,
  updatePostBodySchema,
  updatePostPinBodySchema,
  updatePostStatusBodySchema,
} from "@forum-reddit/types";

type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
type PostDetailsParams = z.infer<typeof postDetailsParamsSchema>;
type CreatePostBody = z.infer<typeof createPostBodySchema>;
type UpdatePostBody = z.infer<typeof updatePostBodySchema>;
type UpdatePostStatusBody = z.infer<typeof updatePostStatusBodySchema>;
type UpdatePostPinBody = z.infer<typeof updatePostPinBodySchema>;

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

  getPost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostDetailsParams;
      const result = await this.postsService.getPost(params.postId, request.currentUser?.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  createPost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const body = request.body as CreatePostBody;
      const result = await this.postsService.createPost(body, request.currentUser!.id);

      response.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  updatePost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostDetailsParams;
      const body = request.body as UpdatePostBody;
      const result = await this.postsService.updatePost(params.postId, body, request.currentUser!.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deletePost = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostDetailsParams;
      const result = await this.postsService.deletePost(params.postId, request.currentUser!.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostDetailsParams;
      const body = request.body as UpdatePostStatusBody;
      const result = await this.postsService.updateStatus(params.postId, body, request.currentUser!.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updatePinnedState = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as PostDetailsParams;
      const body = request.body as UpdatePostPinBody;
      const result = await this.postsService.updatePinnedState(params.postId, body, request.currentUser!.id);

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
