import type { PostStatus } from "@prisma/client";

export type SavedPostListItemDto = {
  id: string;
  title: string;
  contentPreview: string | null;
  author: {
    id: string;
    username: string;
    displayName: string;
  } | null;
  status: PostStatus;
  isPinned: boolean;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: Date;
  updatedAt: Date;
  savedAt: Date;
};
