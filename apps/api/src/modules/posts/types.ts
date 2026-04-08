import type { PostStatus } from "@prisma/client";

export type ListPostsQuery = {
  page: number;
  limit: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
};

export type PostAuthorDto = {
  id: string;
  username: string;
  displayName: string;
} | null;

export type PostSummaryDto = {
  id: string;
  title: string;
  contentPreview: string | null;
  author: PostAuthorDto;
  status: PostStatus;
  isPinned: boolean;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PostDetailDto = {
  id: string;
  title: string;
  content: string | null;
  author: PostAuthorDto;
  status: PostStatus;
  isPinned: boolean;
  wasEdited: boolean;
  editCount: number;
  lastEditedAt: Date | null;
  deletedAt: Date | null;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  acceptsComments: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedPostsResponse = {
  data: PostSummaryDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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
