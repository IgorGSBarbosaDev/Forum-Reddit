import type { RequestHandler } from "express";
import { z } from "zod";

import { RequestValidationError } from "../errors/request-validation-error";
import type { AuthenticatedUser } from "../types/authenticated-user";

const currentUserHeaderSchema = z.string().trim().min(1, "x-user-id header must not be empty");
const currentUserRoleHeaderSchema = z.enum(["user", "moderator", "admin"]).default("user");

function normalizeHeaderValue(headerValue: string | string[] | undefined) {
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
}

export const resolveCurrentUser: RequestHandler = (request, _response, next) => {
  const rawUserId = normalizeHeaderValue(request.header("x-user-id"));
  const rawUserRole = normalizeHeaderValue(request.header("x-user-role"));

  if (rawUserId === undefined) {
    request.currentUser = undefined;
    next();
    return;
  }

  const result = currentUserHeaderSchema.safeParse(rawUserId);

  if (!result.success) {
    next(new RequestValidationError("Invalid authentication header.", result.error.issues));
    return;
  }

  const roleResult = currentUserRoleHeaderSchema.safeParse(rawUserRole);

  if (!roleResult.success) {
    next(new RequestValidationError("Invalid authentication header.", roleResult.error.issues));
    return;
  }

  const currentUser: AuthenticatedUser = {
    id: result.data,
    role: roleResult.data,
  };

  request.currentUser = currentUser;
  next();
};
