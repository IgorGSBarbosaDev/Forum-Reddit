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

export function validateBody<TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler {
	return (req, _res, next) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			next(
				new RequestValidationError(
					"Invalid request body.",
					result.error.issues,
				),
			);
			return;
		}

		req.body = result.data;
		next();
	};
}
