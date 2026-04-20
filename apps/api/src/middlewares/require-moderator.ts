import type { RequestHandler } from "express";

import { canModerate } from "@forum-reddit/auth";
import { AuthenticationRequiredError, ForbiddenError } from "@forum-reddit/core";

type ActiveUserGuard = {
  assertActiveUser(currentUserId: string): Promise<void>;
};

export function createRequireModerator(currentUserGuard: ActiveUserGuard): RequestHandler {
  return async (request, _response, next) => {
    if (!request.currentUser) {
      next(new AuthenticationRequiredError());
      return;
    }

    try {
      await currentUserGuard.assertActiveUser(request.currentUser.id);

      if (!canModerate(request.currentUser.role)) {
        next(new ForbiddenError("Moderator permissions are required."));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
