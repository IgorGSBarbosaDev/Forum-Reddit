import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { fetchUserFollowing } from "../fetchers/users-fetchers";

export function useUserFollowingQuery(userId: string | undefined, page: number, limit: number) {
  const api = useForumApi();
  const { viewerId } = useAuthSession();

  return useQuery({
    queryKey: queryKeys.users.following(userId ?? "", page, limit, viewerId),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User id is required.");
      }

      return fetchUserFollowing(api, userId, { page, limit });
    },
  });
}
