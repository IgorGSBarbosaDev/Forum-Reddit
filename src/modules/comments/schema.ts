import { z } from "zod";

import { commentIdParamsSchema, postIdParamsSchema } from "../../schemas/common/id.schema";

export const createCommentBodySchema = z.object({
  content: z.string().trim().min(1, "content is required").max(5000, "content must be at most 5000 characters"),
});

export const updateCommentBodySchema = createCommentBodySchema;

export const postCommentParamsSchema = postIdParamsSchema;
export const commentReplyParamsSchema = commentIdParamsSchema;
