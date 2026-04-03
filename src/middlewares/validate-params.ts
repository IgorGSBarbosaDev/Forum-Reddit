import type { RequestHandler } from "express";
import type { ZodTypeAny, ZodError } from "zod";

export class RequestParamsError extends Error {
    statusCode = 400;
    code = "PARAMS_ERROR";
    issues: ZodError["issues"];

    constructor(message: string, issues: ZodError["issues"]) {
        super(message);
        this.name = "RequestParamsError";
        this.issues = issues;
    }
}

export function validateParams<TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            next(
                new RequestParamsError(
                    "Invalid request params.",
                    result.error.issues,
                ),
            );
            return;
        }

        req.params = result.data;
        next();
    };
}