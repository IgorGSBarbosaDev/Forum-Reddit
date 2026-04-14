import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CommentNode, CreateCommentInput, UpdateCommentInput } from "@forum-reddit/types";

import { useAuthSession } from "../../auth-context/auth-context";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { setCommentLikeState } from "../lib/comment-tree";

type OptimisticCommentLikeContext = {
  previousTree?: CommentNode[];
};

async function invalidateCommentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  viewerId: string | undefined,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.comments.tree(postId, viewerId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId, viewerId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.feedScope(viewerId) }),
  ]);
}

export function useCreateRootCommentMutation(postId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();
  const { viewerId } = useAuthSession();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => api.comments.createOnPost(postId, input),
    onSuccess: async () => {
      await invalidateCommentQueries(queryClient, postId, viewerId);
    },
  });
}

export function useCreateReplyCommentMutation(postId: string, commentId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();
  const { viewerId } = useAuthSession();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => api.comments.createReply(commentId, input),
    onSuccess: async () => {
      await invalidateCommentQueries(queryClient, postId, viewerId);
    },
  });
}

export function useUpdateCommentMutation(postId: string, commentId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();
  const { viewerId } = useAuthSession();

  return useMutation({
    mutationFn: (input: UpdateCommentInput) => api.comments.update(commentId, input),
    onSuccess: async () => {
      await invalidateCommentQueries(queryClient, postId, viewerId);
    },
  });
}

export function useDeleteCommentMutation(postId: string, commentId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();
  const { viewerId } = useAuthSession();

  return useMutation({
    mutationFn: () => api.comments.remove(commentId),
    onSuccess: async () => {
      await invalidateCommentQueries(queryClient, postId, viewerId);
    },
  });
}

export function useLikeCommentMutation(postId: string, commentId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();
  const { viewerId } = useAuthSession();

  return useMutation({
    mutationFn: () => api.comments.like(commentId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.tree(postId, viewerId) });
      const previousTree = queryClient.getQueryData<CommentNode[]>(
        queryKeys.comments.tree(postId, viewerId),
      );

      queryClient.setQueryData<CommentNode[] | undefined>(
        queryKeys.comments.tree(postId, viewerId),
        (currentTree) => {
          if (!currentTree) {
            return currentTree;
          }

          return setCommentLikeState(currentTree, commentId, true);
        },
      );

      return { previousTree } satisfies OptimisticCommentLikeContext;
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKeys.comments.tree(postId, viewerId), context?.previousTree);
    },
    onSettled: async () => {
      await invalidateCommentQueries(queryClient, postId, viewerId);
    },
  });
}

export function useUnlikeCommentMutation(postId: string, commentId: string) {
  const api = useForumApi();
  const queryClient = useQueryClient();
  const { viewerId } = useAuthSession();

  return useMutation({
    mutationFn: () => api.comments.unlike(commentId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.comments.tree(postId, viewerId) });
      const previousTree = queryClient.getQueryData<CommentNode[]>(
        queryKeys.comments.tree(postId, viewerId),
      );

      queryClient.setQueryData<CommentNode[] | undefined>(
        queryKeys.comments.tree(postId, viewerId),
        (currentTree) => {
          if (!currentTree) {
            return currentTree;
          }

          return setCommentLikeState(currentTree, commentId, false);
        },
      );

      return { previousTree } satisfies OptimisticCommentLikeContext;
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKeys.comments.tree(postId, viewerId), context?.previousTree);
    },
    onSettled: async () => {
      await invalidateCommentQueries(queryClient, postId, viewerId);
    },
  });
}
