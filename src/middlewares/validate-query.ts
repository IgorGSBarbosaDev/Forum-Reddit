import type { RequestHandler } from "express";
import type { ZodTypeAny, ZodError } from "zod";

export class RequestValidationError extends Error {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    issues: ZodError["issues"];

    constructor(message: string, issues: ZodError["issues"]) {
        super(message);
        this.name = "RequestValidationError";
        this.issues = issues;
    }
}

export function validateQuery<TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);

        if (!result.success){
            next(
                new RequestValidationError(
                    "Invalid request query.",
                    result.error.issues,
                ),
            )
            return;
        }

        req.query = result.data;
        next();
    };
}