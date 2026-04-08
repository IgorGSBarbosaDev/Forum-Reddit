import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";

export function usePostDetail(postId: string | undefined) {
  const api = useForumApi();

  return useQuery({
    queryKey: queryKeys.posts.detail(postId ?? ""),
    enabled: Boolean(postId),
    queryFn: async () => {
      if (!postId) {
        throw new Error("Post id is required.");
      }

      return api.posts.getById(postId);
    },
  });
}