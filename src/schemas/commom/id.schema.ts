import { z } from "zod";

export function createIdSchema(fieldName: string) {
  return z
    .string()
    .trim()
    .min(1, `${fieldName} is required`);
}

export const postIdSchema = createIdSchema("postId");
export const userIdSchema = createIdSchema("userId");
export const commentIdSchema = createIdSchema("commentId");

export const postIdParamsSchema = z.object({
  postId: postIdSchema,
});

export const userIdParamsSchema = z.object({
  userId: userIdSchema,
});

export const commentIdParamsSchema = z.object({
  commentId: commentIdSchema,
});
