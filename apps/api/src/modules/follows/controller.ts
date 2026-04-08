import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { userIdParamsSchema } from "../../schemas/common/id.schema";
import { FollowsService } from "./service";

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
