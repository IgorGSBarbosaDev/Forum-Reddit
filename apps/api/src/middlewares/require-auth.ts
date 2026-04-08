import type { RequestHandler } from "express";

import { AuthenticationRequiredError } from "../errors/authentication-required-error";

export const requireAuth: RequestHandler = (request, _response, next) => {
  if (!request.currentUser) {
    next(new AuthenticationRequiredError());
    return;
  }

  next();
};
