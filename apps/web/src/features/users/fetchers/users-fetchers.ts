import type { PaginationQuery } from "../../../shared/api/forum-api";
import type { ForumApi } from "../../../shared/api/forum-api";

export function fetchUserProfile(api: ForumApi, userId: string) {
  return api.users.getProfile(userId);
}

export function fetchUserRelationship(api: ForumApi, userId: string) {
  return api.users.getRelationship(userId);
}

export function fetchUserFollowers(api: ForumApi, userId: string, query: PaginationQuery) {
  return api.users.listFollowers(userId, query);
}

export function fetchUserFollowing(api: ForumApi, userId: string, query: PaginationQuery) {
  return api.users.listFollowing(userId, query);
}
