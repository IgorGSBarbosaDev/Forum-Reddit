import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

import { userListQuerySchema, userProfileParamsSchema } from "./schema";
import { UsersService } from "./service";

type UserProfileParams = z.infer<typeof userProfileParamsSchema>;
type UserListQuery = z.infer<typeof userListQuerySchema>;

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  getProfile = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as UserProfileParams;
      const result = await this.usersService.getProfile(params.userId, request.currentUser?.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listFollowers = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as UserProfileParams;
      const query = request.query as unknown as UserListQuery;
      const result = await this.usersService.listFollowers(
        params.userId,
        request.currentUser?.id,
        query.page,
        query.limit,
      );
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  listFollowing = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as UserProfileParams;
      const query = request.query as unknown as UserListQuery;
      const result = await this.usersService.listFollowing(
        params.userId,
        request.currentUser?.id,
        query.page,
        query.limit,
      );
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getRelationship = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const params = request.params as unknown as UserProfileParams;
      const result = await this.usersService.getRelationship(params.userId, request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
