import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { FollowsService } from "@forum-reddit/core";
import { userIdParamsSchema } from "@forum-reddit/types";

type UserIdParams = z.infer<typeof userIdParamsSchema>;

export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  followUser = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as UserIdParams;
      const result = await this.followsService.followUser(params.userId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  unfollowUser = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as UserIdParams;
      const result = await this.followsService.unfollowUser(params.userId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
