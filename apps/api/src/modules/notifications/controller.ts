import type { NextFunction, Request, Response } from "express";

type ProcessPendingEventsHandler = (request: Request) => Promise<{ processedCount: number }>;

export class NotificationsController {
  constructor(private readonly processPendingEventsHandler: ProcessPendingEventsHandler) {}

  processPendingEvents = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await this.processPendingEventsHandler(request);
      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
