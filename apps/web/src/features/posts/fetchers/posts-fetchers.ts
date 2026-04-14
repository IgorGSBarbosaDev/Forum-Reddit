import type { ListPostsQuery, PostSortBy, SortOrder } from "@forum-reddit/types";

import type { ForumApi } from "../../../shared/api/forum-api";

export type NormalizedFeedQuery = {
  page: number;
  limit: number;
  sortBy: PostSortBy;
  order: SortOrder;
};

function toSortBy(value: ListPostsQuery["sortBy"]): PostSortBy {
  if (value === "updatedAt" || value === "title") {
    return value;
  }

  return "createdAt";
}

function toSortOrder(value: ListPostsQuery["order"]): SortOrder {
  if (value === "asc") {
    return "asc";
  }

  return "desc";
}

function toPositiveInt(value: number | undefined, fallback: number): number {
  if (!value || Number.isNaN(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

export function normalizeFeedQuery(query: ListPostsQuery): NormalizedFeedQuery {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, 20), 100);

  return {
    page,
    limit,
    sortBy: toSortBy(query.sortBy),
    order: toSortOrder(query.order),
  };
}

export function fetchFeedPosts(api: ForumApi, query: ListPostsQuery) {
  return api.posts.list(normalizeFeedQuery(query));
}

export function fetchPostDetail(api: ForumApi, postId: string) {
  return api.posts.getById(postId);
}
