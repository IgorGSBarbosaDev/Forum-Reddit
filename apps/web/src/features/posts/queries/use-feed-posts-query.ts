import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import type { ListPostsQuery } from "@forum-reddit/types";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { fetchFeedPosts, normalizeFeedQuery } from "../fetchers/posts-fetchers";

export function useFeedPostsQuery(query: ListPostsQuery) {
  const api = useForumApi();
  const { viewerId } = useAuthSession();

  const normalizedQuery = useMemo(
    () => normalizeFeedQuery(query),
    [query.limit, query.order, query.page, query.sortBy],
  );

  return useQuery({
    queryKey: queryKeys.posts.feed(normalizedQuery, viewerId),
    queryFn: () => fetchFeedPosts(api, normalizedQuery),
  });
}
