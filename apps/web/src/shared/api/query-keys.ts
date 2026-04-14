import type { PostSortBy, SortOrder } from "@forum-reddit/types";

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
    feedScope: (viewerId: string | undefined) => ["posts", "feed", toViewerKey(viewerId)] as const,
    feed: (query: FeedQueryKeyInput, viewerId: string | undefined) =>
      [...queryKeys.posts.feedScope(viewerId), query.sortBy, query.order, query.page, query.limit] as const,
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
    followersScope: (userId: string, viewerId: string | undefined) =>
      ["users", "followers", userId, toViewerKey(viewerId)] as const,
    followers: (userId: string, page: number, limit: number, viewerId: string | undefined) =>
      [...queryKeys.users.followersScope(userId, viewerId), page, limit] as const,
    followingScope: (userId: string, viewerId: string | undefined) =>
      ["users", "following", userId, toViewerKey(viewerId)] as const,
    following: (userId: string, page: number, limit: number, viewerId: string | undefined) =>
      [...queryKeys.users.followingScope(userId, viewerId), page, limit] as const,
    relationship: (userId: string, viewerId: string) =>
      ["users", "relationship", userId, toViewerKey(viewerId)] as const,
  },
  savedPosts: {
    scope: (viewerId: string) => ["saved-posts", "list", viewerId] as const,
    list: (viewerId: string, page: number, limit: number) =>
      [...queryKeys.savedPosts.scope(viewerId), page, limit] as const,
  },
};
