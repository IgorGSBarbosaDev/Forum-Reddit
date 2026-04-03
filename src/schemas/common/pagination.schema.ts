import { z } from "zod";

type PaginationNumberOptions = {
  defaultValue: number;
  max?: number;
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function createPaginationNumberSchema(
  fieldName: string,
  options: PaginationNumberOptions,
) {
  const schema = z.coerce
    .number()
    .int({ message: `${fieldName} must be an integer` })
    .min(1, { message: `${fieldName} must be at least 1` });

  const boundedSchema =
    typeof options.max === "number"
      ? schema.max(options.max, {
          message: `${fieldName} must be at most ${options.max}`,
        })
      : schema;

  return boundedSchema.default(options.defaultValue);
}

export const pageSchema = createPaginationNumberSchema("page", {
  defaultValue: DEFAULT_PAGE,
});

export const limitSchema = createPaginationNumberSchema("limit", {
  defaultValue: DEFAULT_LIMIT,
  max: MAX_LIMIT,
});

export const cursorSchema = z.string().trim().min(1).optional();

export const paginationQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  cursor: cursorSchema,
});
