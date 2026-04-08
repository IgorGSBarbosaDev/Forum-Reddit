import type { RequestHandler } from "express";

import { AUTHORIZED_MODERATOR_ROLES } from "../constants/forum";
import { AuthenticationRequiredError } from "../errors/authentication-required-error";
import { ForbiddenError } from "../errors/forbidden-error";

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
