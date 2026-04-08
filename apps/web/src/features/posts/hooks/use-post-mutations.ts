import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePostInput,
  PaginatedResponse,
  PostDetail,
  PostSummary,
  UpdatePostInput,
} from "@forum-reddit/shared-types";

import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";

type FeedCacheSnapshot = Array<readonly [readonly unknown[], PaginatedResponse<PostSummary> | undefined]>;

type OptimisticCacheContext = {
  previousDetail?: PostDetail;
  previousFeeds: FeedCacheSnapshot;
};

function updateFeedCache(
  payload: PaginatedResponse<PostSummary> | undefined,
  postId: string,
  updater: (post: PostSummary) => PostSummary,
): PaginatedResponse<PostSummary> | undefined {
  if (!payload) {
    return payload;
  }

  return {
    ...payload,
    data: payload.data.map((post) => (post.id === postId ? updater(post) : post)),
  };
}

function usePostOptimisticActions(postId: string) {
  const queryClient = useQueryClient();

  function snapshotCaches(): OptimisticCacheContext {
    return {
      previousDetail: queryClient.getQueryData<PostDetail>(queryKeys.posts.detail(postId)),
      previousFeeds: queryClient.getQueriesData<PaginatedResponse<PostSummary>>({
        queryKey: ["posts", "feed"],
      }),
    };
  }

  function rollbackCaches(context: OptimisticCacheContext | undefined) {
    if (!context) {
      return;
    }

    if (context.previousDetail) {
      queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousDetail);
    }

    for (const [key, payload] of context.previousFeeds) {
      queryClient.setQueryData(key, payload);
    }
  }

  function patchLikeState(nextLikedByMe: boolean) {
    queryClient.setQueryData<PostDetail | undefined>(queryKeys.posts.detail(postId), (current) => {
      if (!current) {
        return current;
      }

      if (current.likedByMe === nextLikedByMe) {
        return current;
      }

      return {
        ...current,
        likedByMe: nextLikedByMe,
        likesCount: Math.max(0, current.likesCount + (nextLikedByMe ? 1 : -1)),
      };
    });

    queryClient.setQueriesData<PaginatedResponse<PostSummary>>({ queryKey: ["posts", "feed"] }, (current) =>
      updateFeedCache(current, postId, (post) => {
        if (post.likedByMe === nextLikedByMe) {
          return post;
        }

        return {
          ...post,
          likedByMe: nextLikedByMe,
          likesCount: Math.max(0, post.likesCount + (nextLikedByMe ? 1 : -1)),
        };
      }),
    );
  }

  function patchSaveState(nextSavedByMe: boolean) {
    queryClient.setQueryData<PostDetail | undefined>(queryKeys.posts.detail(postId), (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        savedByMe: nextSavedByMe,
      };
    });

    queryClient.setQueriesData<PaginatedResponse<PostSummary>>({ queryKey: ["posts", "feed"] }, (current) =>
      updateFeedCache(current, postId, (post) => ({
        ...post,
        savedByMe: nextSavedByMe,
      })),
    );
  }

  async function cancelQueries() {
    await Promise.all([
      queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) }),
      queryClient.cancelQueries({ queryKey: ["posts", "feed"] }),
      queryClient.cancelQueries({ queryKey: ["saved-posts", "list"] }),
    ]);
  }

  async function invalidatePostQueries() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) }),
      queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }),
      queryClient.invalidateQueries({ queryKey: ["saved-posts", "list"] }),
    ]);
  }

  return {
    cancelQueries,
    invalidatePostQueries,
    patchLikeState,
    patchSaveState,
    rollbackCaches,
    snapshotCaches,
  };
}

export function useCreatePostMutation() {
  const api = useForumApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePostInput) => api.posts.create(input),
    onSuccess: async (createdPost) => {
      queryClient.setQueryData(queryKeys.posts.detail(createdPost.id), createdPost);
      await queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });
}

export function useUpdatePostMutation(postId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdatePostInput) => api.posts.update(postId, input),
    onSuccess: async (updatedPost) => {
      queryClient.setQueryData(queryKeys.posts.detail(postId), updatedPost);
      await queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });
}

export function useDeletePostMutation(postId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.posts.remove(postId),
    onSuccess: async (deletedPost) => {
      queryClient.setQueryData(queryKeys.posts.detail(postId), deletedPost);
      await queryClient.invalidateQueries({ queryKey: ["posts", "feed"] });
    },
  });
}

export function useLikePostMutation(postId: string) {
  const api = useForumApi();
  const actions = usePostOptimisticActions(postId);

  return useMutation({
    mutationFn: () => api.posts.like(postId),
    onMutate: async () => {
      await actions.cancelQueries();
      const context = actions.snapshotCaches();
      actions.patchLikeState(true);
      return context;
    },
    onError: (_, __, context) => {
      actions.rollbackCaches(context);
    },
    onSettled: async () => {
      await actions.invalidatePostQueries();
    },
  });
}

export function useUnlikePostMutation(postId: string) {
  const api = useForumApi();
  const actions = usePostOptimisticActions(postId);

  return useMutation({
    mutationFn: () => api.posts.unlike(postId),
    onMutate: async () => {
      await actions.cancelQueries();
      const context = actions.snapshotCaches();
      actions.patchLikeState(false);
      return context;
    },
    onError: (_, __, context) => {
      actions.rollbackCaches(context);
    },
    onSettled: async () => {
      await actions.invalidatePostQueries();
    },
  });
}

export function useSavePostMutation(postId: string) {
  const api = useForumApi();
  const actions = usePostOptimisticActions(postId);

  return useMutation({
    mutationFn: () => api.posts.save(postId),
    onMutate: async () => {
      await actions.cancelQueries();
      const context = actions.snapshotCaches();
      actions.patchSaveState(true);
      return context;
    },
    onError: (_, __, context) => {
      actions.rollbackCaches(context);
    },
    onSettled: async () => {
      await actions.invalidatePostQueries();
    },
  });
}

export function useUnsavePostMutation(postId: string) {
  const api = useForumApi();
  const actions = usePostOptimisticActions(postId);

  return useMutation({
    mutationFn: () => api.posts.unsave(postId),
    onMutate: async () => {
      await actions.cancelQueries();
      const context = actions.snapshotCaches();
      actions.patchSaveState(false);
      return context;
    },
    onError: (_, __, context) => {
      actions.rollbackCaches(context);
    },
    onSettled: async () => {
      await actions.invalidatePostQueries();
    },
  });
}