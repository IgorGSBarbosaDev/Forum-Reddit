import type { PostSortBy, SortOrder } from "@forum-reddit/shared-types";

export type FeedQueryKeyInput = {
  page: number;
  limit: number;
  sortBy: PostSortBy;
  order: SortOrder;
};

export const PUBLIC_VIEWER_KEY = "public";

export function toViewerKey(viewerId: string | undefined) {
  return viewerId && viewerId.trim().length > 0 ? viewerId.trim() : PUBLIC_VIEWER_KEY;
}

export const queryKeys = {
  platform: {
    health: ["platform", "health"] as const,
    me: (viewerId: string, role: string) => ["platform", "me", viewerId, role] as const,
  },
  posts: {
    feed: (query: FeedQueryKeyInput, viewerId: string | undefined) =>
      ["posts", "feed", query.page, query.limit, query.sortBy, query.order, toViewerKey(viewerId)] as const,
    detail: (postId: string, viewerId: string | undefined) =>
      ["posts", "detail", postId, toViewerKey(viewerId)] as const,
  },
  comments: {
    tree: (postId: string, viewerId: string | undefined) =>
      ["comments", "tree", postId, toViewerKey(viewerId)] as const,
  },
  users: {
    profile: (userId: string, viewerId: string | undefined) =>
      ["users", "profile", userId, toViewerKey(viewerId)] as const,
    followers: (userId: string, page: number, limit: number, viewerId: string | undefined) =>
      ["users", "followers", userId, page, limit, toViewerKey(viewerId)] as const,
    following: (userId: string, page: number, limit: number, viewerId: string | undefined) =>
      ["users", "following", userId, page, limit, toViewerKey(viewerId)] as const,
    relationship: (userId: string, viewerId: string) =>
      ["users", "relationship", userId, viewerId] as const,
  },
  savedPosts: {
    list: (viewerId: string, page: number, limit: number) =>
      ["saved-posts", "list", viewerId, page, limit] as const,
  },
};
