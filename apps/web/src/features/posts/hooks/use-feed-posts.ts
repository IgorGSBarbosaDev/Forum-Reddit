import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import type { ListPostsQuery, PostSortBy, SortOrder } from "@forum-reddit/shared-types";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";

type NormalizedFeedQuery = {
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

export function useFeedPosts(query: ListPostsQuery) {
  const api = useForumApi();
  const { viewerId } = useAuthSession();

  const normalizedQuery = useMemo(
    () => normalizeFeedQuery(query),
    [query.limit, query.order, query.page, query.sortBy],
  );

  return useQuery({
    queryKey: queryKeys.posts.feed(normalizedQuery, viewerId),
    queryFn: () => api.posts.list(normalizedQuery),
  });
}
