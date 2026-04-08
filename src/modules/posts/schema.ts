import { PostStatus } from "@prisma/client";
import { z } from "zod";

import { postIdParamsSchema } from "../../schemas/common/id.schema";
import { paginationQuerySchema } from "../../schemas/common/pagination.schema";
import { createSortQuerySchema } from "../../schemas/common/sort.schema";

const feedSortQuerySchema = createSortQuerySchema(["createdAt", "updatedAt", "title"]);

export const listPostsQuerySchema = paginationQuerySchema.merge(feedSortQuerySchema);

export const createPostBodySchema = z.object({
  title: z.string().trim().min(1, "title is required").max(160, "title must be at most 160 characters"),
  content: z.string().trim().max(10000, "content must be at most 10000 characters").optional().nullable(),
});

export const updatePostBodySchema = z.object({
  title: z.string().trim().min(1, "title must not be empty").max(160).optional(),
  content: z.string().trim().max(10000, "content must be at most 10000 characters").optional().nullable(),
}).refine((value) => value.title !== undefined || value.content !== undefined, {
  message: "At least one field must be provided.",
});

export const updatePostStatusBodySchema = z.object({
  status: z.nativeEnum(PostStatus),
});

export const updatePostPinBodySchema = z.object({
  isPinned: z.boolean(),
});

export const postDetailsParamsSchema = postIdParamsSchema;
