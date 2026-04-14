import { paginationQuerySchema, postIdParamsSchema } from "./common";

import type { PostAuthor, PostStatus } from "./posts";

export type SavedPostListItem = {
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
  savedAt: string;
};

export const savedPostParamsSchema = postIdParamsSchema;
export const listSavedPostsQuerySchema = paginationQuerySchema;
