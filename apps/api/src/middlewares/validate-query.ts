import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

import { RequestValidationError } from "../errors/request-validation-error";

export function validateQuery<TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      next(new RequestValidationError("Invalid request query.", result.error.issues));
      return;
    }

    req.query = result.data as typeof req.query;
    next();
  };
}
