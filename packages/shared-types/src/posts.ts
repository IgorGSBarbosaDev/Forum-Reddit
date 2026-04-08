export type PostAuthor = {
  id: string;
  username: string | null;
  displayName: string | null;
} | null;

export type PostSummary = {
  id: string;
  title: string;
  contentPreview: string | null;
  author: PostAuthor;
  status: "ACTIVE" | "BLOCKED" | "ARCHIVED";
  isPinned: boolean;
  commentsCount: number;
  likesCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: string;
  updatedAt: string;
};
