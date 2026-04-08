import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

import { RequestValidationError } from "../errors/request-validation-error";

export function validateBody<TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(new RequestValidationError("Invalid request body.", result.error.issues));
      return;
    }

    req.body = result.data;
    next();
  };
}
