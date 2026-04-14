import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { fetchPostDetail } from "../fetchers/posts-fetchers";

export function usePostDetailQuery(postId: string | undefined) {
  const api = useForumApi();
  const { viewerId } = useAuthSession();

  return useQuery({
    queryKey: queryKeys.posts.detail(postId ?? "", viewerId),
    enabled: Boolean(postId),
    queryFn: async () => {
      if (!postId) {
        throw new Error("Post id is required.");
      }

      return fetchPostDetail(api, postId);
    },
  });
}
