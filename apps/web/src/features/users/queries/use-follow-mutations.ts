import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginatedResponse, RelationshipResponse, UserProfile, UserSummary } from "@forum-reddit/types";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";

type UserListSnapshot = Array<readonly [readonly unknown[], PaginatedResponse<UserSummary> | undefined]>;

type FollowMutationContext = {
  previousTargetProfile?: UserProfile;
  previousViewerProfile?: UserProfile;
  previousRelationship?: RelationshipResponse;
  previousFollowersLists: UserListSnapshot;
  previousFollowingLists: UserListSnapshot;
};

function patchFollowingState(
  payload: PaginatedResponse<UserSummary> | undefined,
  targetUserId: string,
  nextFollowing: boolean,
): PaginatedResponse<UserSummary> | undefined {
  if (!payload) {
    return payload;
  }

  let changed = false;

  const nextUsers = payload.data.map((user) => {
    if (user.id !== targetUserId || user.following === nextFollowing) {
      return user;
    }

    changed = true;

    return {
      ...user,
      following: nextFollowing,
    };
  });

  if (!changed) {
    return payload;
  }

  return {
    ...payload,
    data: nextUsers,
  };
}

function useOptimisticFollowMutation(targetUserId: string, nextFollowing: boolean) {
  const api = useForumApi();
  const queryClient = useQueryClient();
  const { viewerId } = useAuthSession();

  const targetFollowersScope = queryKeys.users.followersScope(targetUserId, viewerId);
  const viewerFollowingScope = viewerId ? queryKeys.users.followingScope(viewerId, viewerId) : null;

  return useMutation({
    mutationFn: async () => {
      if (nextFollowing) {
        return api.users.follow(targetUserId);
      }

      return api.users.unfollow(targetUserId);
    },
    onMutate: async () => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.users.profile(targetUserId, viewerId) }),
        queryClient.cancelQueries({ queryKey: targetFollowersScope }),
        viewerFollowingScope
          ? queryClient.cancelQueries({ queryKey: viewerFollowingScope })
          : Promise.resolve(),
        viewerId
          ? queryClient.cancelQueries({ queryKey: queryKeys.users.profile(viewerId, viewerId) })
          : Promise.resolve(),
        viewerId
          ? queryClient.cancelQueries({
              queryKey: queryKeys.users.relationship(targetUserId, viewerId),
            })
          : Promise.resolve(),
      ]);

      const context: FollowMutationContext = {
        previousTargetProfile: queryClient.getQueryData<UserProfile>(
          queryKeys.users.profile(targetUserId, viewerId),
        ),
        previousViewerProfile: viewerId
          ? queryClient.getQueryData<UserProfile>(queryKeys.users.profile(viewerId, viewerId))
          : undefined,
        previousRelationship: viewerId
          ? queryClient.getQueryData<RelationshipResponse>(
              queryKeys.users.relationship(targetUserId, viewerId),
            )
          : undefined,
        previousFollowersLists: queryClient.getQueriesData<PaginatedResponse<UserSummary>>({
          queryKey: targetFollowersScope,
        }),
        previousFollowingLists: viewerFollowingScope
          ? queryClient.getQueriesData<PaginatedResponse<UserSummary>>({
              queryKey: viewerFollowingScope,
            })
          : [],
      };

      queryClient.setQueryData<UserProfile | undefined>(
        queryKeys.users.profile(targetUserId, viewerId),
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            following: nextFollowing,
            followersCount: Math.max(0, current.followersCount + (nextFollowing ? 1 : -1)),
          };
        },
      );

      if (viewerId) {
        queryClient.setQueryData<UserProfile | undefined>(
          queryKeys.users.profile(viewerId, viewerId),
          (current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              followingCount: Math.max(0, current.followingCount + (nextFollowing ? 1 : -1)),
            };
          },
        );

        queryClient.setQueryData<RelationshipResponse>(queryKeys.users.relationship(targetUserId, viewerId), {
          following: nextFollowing,
        });
      }

      if (viewerFollowingScope) {
        queryClient.setQueriesData<PaginatedResponse<UserSummary>>(
          { queryKey: viewerFollowingScope },
          (current) => patchFollowingState(current, targetUserId, nextFollowing),
        );
      }

      return context;
    },
    onError: (_, __, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(
        queryKeys.users.profile(targetUserId, viewerId),
        context.previousTargetProfile,
      );

      if (viewerId) {
        queryClient.setQueryData(
          queryKeys.users.profile(viewerId, viewerId),
          context.previousViewerProfile,
        );
        queryClient.setQueryData(
          queryKeys.users.relationship(targetUserId, viewerId),
          context.previousRelationship,
        );
      }

      for (const [key, payload] of context.previousFollowersLists) {
        queryClient.setQueryData(key, payload);
      }

      for (const [key, payload] of context.previousFollowingLists) {
        queryClient.setQueryData(key, payload);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(targetUserId, viewerId) }),
        queryClient.invalidateQueries({ queryKey: targetFollowersScope }),
        viewerFollowingScope
          ? queryClient.invalidateQueries({ queryKey: viewerFollowingScope })
          : Promise.resolve(),
        viewerId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(viewerId, viewerId) })
          : Promise.resolve(),
        viewerId
          ? queryClient.invalidateQueries({
              queryKey: queryKeys.users.relationship(targetUserId, viewerId),
            })
          : Promise.resolve(),
      ]);
    },
  });
}

export function useFollowUserMutation(targetUserId: string) {
  return useOptimisticFollowMutation(targetUserId, true);
}

export function useUnfollowUserMutation(targetUserId: string) {
  return useOptimisticFollowMutation(targetUserId, false);
}
