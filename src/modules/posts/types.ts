import type { PostStatus } from "@prisma/client";

export type ListPostsQuery = {
  page: number;
  limit: number;
  sortBy?: "createdAt" | "updatedAt" | "title";
  order?: "asc" | "desc";
};

export type PostListAuthor = {
  id: string;
  username: string;
  displayName: string;
} | null;

export type PostListItem = {
  id: string;
  title: string;
  contentPreview: string | null;
  author: PostListAuthor;
  status: PostStatus;
  isPinned: boolean;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginatedPostsResponse = {
  data: PostListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
