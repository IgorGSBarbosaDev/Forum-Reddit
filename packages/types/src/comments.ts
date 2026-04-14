import { z } from "zod";

import { commentIdParamsSchema, postIdParamsSchema } from "./common";

export type CommentAuthor = {
  id: string;
  username: string | null;
  displayName: string | null;
} | null;

export type CommentNode = {
  id: string;
  postId: string;
  parentId: string | null;
  depth: number;
  content: string;
  author: CommentAuthor;
  wasEdited: boolean;
  editCount: number;
  lastEditedAt: string | null;
  deletedAt: string | null;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string;
  replies: CommentNode[];
};

export type CreateCommentInput = {
  content: string;
};

export type UpdateCommentInput = {
  content: string;
};

export const createCommentBodySchema = z.object({
  content: z.string().trim().min(1, "content is required").max(5000, "content must be at most 5000 characters"),
});

export const updateCommentBodySchema = createCommentBodySchema;

export const postCommentParamsSchema = postIdParamsSchema;
export const commentReplyParamsSchema = commentIdParamsSchema;
