import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

import { RequestValidationError } from "../errors/request-validation-error";

export function validateParams<TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(new RequestValidationError("Invalid request params.", result.error.issues));
      return;
    }

    Object.defineProperty(req, "params", {
      value: result.data,
      configurable: true,
      enumerable: true,
      writable: true,
    });
    next();
  };
}
