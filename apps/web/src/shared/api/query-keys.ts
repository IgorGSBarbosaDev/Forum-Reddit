import type { PostSortBy, SortOrder } from "@forum-reddit/shared-types";

export type FeedQueryKeyInput = {
  page: number;
  limit: number;
  sortBy: PostSortBy;
  order: SortOrder;
};

export const queryKeys = {
  platform: {
    health: ["platform", "health"] as const,
    me: (viewerId: string) => ["platform", "me", viewerId] as const,
  },
  posts: {
    feed: (query: FeedQueryKeyInput) =>
      ["posts", "feed", query.page, query.limit, query.sortBy, query.order] as const,
    detail: (postId: string) => ["posts", "detail", postId] as const,
  },
  comments: {
    tree: (postId: string) => ["comments", "tree", postId] as const,
  },
  users: {
    profile: (userId: string) => ["users", "profile", userId] as const,
    followers: (userId: string, page: number, limit: number) =>
      ["users", "followers", userId, page, limit] as const,
    following: (userId: string, page: number, limit: number) =>
      ["users", "following", userId, page, limit] as const,
    relationship: (userId: string, viewerId: string) =>
      ["users", "relationship", userId, viewerId] as const,
  },
  savedPosts: {
    list: (viewerId: string, page: number, limit: number) =>
      ["saved-posts", "list", viewerId, page, limit] as const,
  },
};