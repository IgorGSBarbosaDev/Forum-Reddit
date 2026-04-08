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
