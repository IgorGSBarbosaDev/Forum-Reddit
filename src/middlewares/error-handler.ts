import type { ErrorRequestHandler } from "express";

import { AuthenticationRequiredError } from "../errors/authentication-required-error";
import { RequestValidationError } from "../errors/request-validation-error";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof RequestValidationError) {
    response.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      errors: error.issues,
    });
    return;
  }

  if (error instanceof AuthenticationRequiredError) {
    response.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    message: "Internal server error.",
    code: "INTERNAL_SERVER_ERROR",
  });
};
