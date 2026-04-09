import type { NextFunction, Request, Response } from "express";

import { NotificationsService } from "./service";

export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  processPendingEvents = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await this.notificationsService.processPendingEvents(request.currentUser!.id);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
