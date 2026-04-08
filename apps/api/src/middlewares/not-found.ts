import type { RequestHandler } from "express";

import { NotFoundError } from "../errors/not-found-error";

export const notFoundHandler: RequestHandler = (_request, _response, next) => {
  next(new NotFoundError("Route not found.", "ROUTE_NOT_FOUND"));
};
