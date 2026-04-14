import { z } from "zod";

import { paginationQuerySchema, createSortQuerySchema, postIdParamsSchema } from "./common";

export type PostAuthor = {
  id: string;
  username: string | null;
  displayName: string | null;
} | null;

export type PostStatus = "ACTIVE" | "BLOCKED" | "ARCHIVED";

export type PostSortBy = "createdAt" | "updatedAt" | "title";

export type SortOrder = "asc" | "desc";

export type ListPostsQuery = {
  page?: number;
  limit?: number;
  sortBy?: PostSortBy;
  order?: SortOrder;
};

export type PostSummary = {
  id: string;
  title: string;
  contentPreview: string | null;
  author: PostAuthor;
  status: PostStatus;
  isPinned: boolean;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PostDetail = {
  id: string;
  title: string;
  content: string | null;
  author: PostAuthor;
  status: PostStatus;
  isPinned: boolean;
  wasEdited: boolean;
  editCount: number;
  lastEditedAt: string | null;
  deletedAt: string | null;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  acceptsComments: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = {
  title: string;
  content?: string | null;
};

export type UpdatePostInput = {
  title?: string;
  content?: string | null;
};

export type UpdatePostStatusInput = {
  status: PostStatus;
};

export type UpdatePostPinInput = {
  isPinned: boolean;
};

export const postStatusSchema = z.enum(["ACTIVE", "BLOCKED", "ARCHIVED"]);

export const listPostsQuerySchema = paginationQuerySchema.merge(
  createSortQuerySchema(["createdAt", "updatedAt", "title"]),
);

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
  status: postStatusSchema,
});

export const updatePostPinBodySchema = z.object({
  isPinned: z.boolean(),
});

export const postDetailsParamsSchema = postIdParamsSchema;
