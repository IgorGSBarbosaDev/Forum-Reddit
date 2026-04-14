import type { RequestHandler } from "express";

import { AuthenticationRequiredError, AUTHORIZED_MODERATOR_ROLES, ForbiddenError } from "@forum-reddit/core";

export const requireModerator: RequestHandler = (request, _response, next) => {
  if (!request.currentUser) {
    next(new AuthenticationRequiredError());
    return;
  }

  if (!AUTHORIZED_MODERATOR_ROLES.includes(request.currentUser.role as "moderator" | "admin")) {
    next(new ForbiddenError("Moderator permissions are required."));
    return;
  }

  next();
};
