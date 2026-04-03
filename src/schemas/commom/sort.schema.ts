import { z } from 'zod';

export const sortOrderSchema = z.enum(['asc', 'desc']);

export function createSortBySchema<const TAllowedFields extends readonly [string, ...string[]]>(
  allowedFields: TAllowedFields,
) {
  return z.enum(allowedFields);
}

export function createSortQuerySchema<const TAllowedFields extends readonly [string, ...string[]]>(
  allowedFields: TAllowedFields,
) {
  return z.object({
    sortBy: createSortBySchema(allowedFields).optional(),
    order: sortOrderSchema.optional(),
  });
}
