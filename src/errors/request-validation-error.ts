import type { ZodIssue } from "zod";

type ValidationIssue = {
  field: string;
  message: string;
};

export class RequestValidationError extends Error {
  public readonly statusCode = 400;
  public readonly code = "VALIDATION_ERROR";
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ZodIssue[]) {
    super(message);
    this.name = "RequestValidationError";
    this.issues = issues.map((issue) => ({
      field: issue.path.length > 0 ? issue.path.join(".") : "request",
      message: issue.message,
    }));
  }
}
