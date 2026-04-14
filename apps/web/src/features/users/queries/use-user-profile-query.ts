import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { fetchUserProfile, fetchUserRelationship } from "../fetchers/users-fetchers";

export function useUserProfileQuery(userId: string | undefined) {
  const api = useForumApi();
  const { viewerId } = useAuthSession();

  return useQuery({
    queryKey: queryKeys.users.profile(userId ?? "", viewerId),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User id is required.");
      }

      return fetchUserProfile(api, userId);
    },
  });
}

export function useUserRelationshipQuery(userId: string | undefined, enabled: boolean) {
  const api = useForumApi();
  const { viewerId } = useAuthSession();

  return useQuery({
    queryKey: queryKeys.users.relationship(userId ?? "", viewerId ?? ""),
    enabled: enabled && Boolean(userId) && Boolean(viewerId),
    queryFn: async () => {
      if (!userId) {
        throw new Error("User id is required.");
      }

      return fetchUserRelationship(api, userId);
    },
  });
}
