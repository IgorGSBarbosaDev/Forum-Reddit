import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { fetchSavedPosts } from "../fetchers/saved-posts-fetchers";

export function useSavedPostsQuery(page: number, limit: number) {
  const api = useForumApi();
  const { auth, hasActiveSession, viewerId } = useAuthSession();

  return useQuery({
    queryKey: queryKeys.savedPosts.list(viewerId ?? auth.userId, page, limit),
    enabled: hasActiveSession,
    queryFn: () => fetchSavedPosts(api, { page, limit }),
  });
}
