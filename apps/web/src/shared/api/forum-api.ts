import type {
  CommentNode,
  CreateCommentInput,
  CreatePostInput,
  FollowResponse,
  LikeResponse,
  ListPostsQuery,
  MeResponse,
  PaginatedResponse,
  PostDetail,
  PostSummary,
  ProcessNotificationsResponse,
  RelationshipResponse,
  SaveResponse,
  SavedPostListItem,
  UpdateCommentInput,
  UpdatePostInput,
  UpdatePostPinInput,
  UpdatePostStatusInput,
  UserProfile,
  UserSummary,
} from "@forum-reddit/shared-types";

import type { HttpClient, QueryParams } from "./http-client";

export type HealthResponse = {
  status: string;
  service: string;
};

export type PaginationQuery = {
  page?: number;
  limit?: number;
};

function encodeId(value: string): string {
  return encodeURIComponent(value);
}

function toPaginationQuery(query?: PaginationQuery): QueryParams | undefined {
  if (!query) {
    return undefined;
  }

  return {
    page: query.page,
    limit: query.limit,
  };
}

export function createForumApi(client: HttpClient) {
  return {
    platform: {
      getHealth: () => client.get<HealthResponse>("/health"),
      getMe: () => client.get<MeResponse>("/me"),
    },
    posts: {
      list: (query: ListPostsQuery = {}) =>
        client.get<PaginatedResponse<PostSummary>>("/posts", { query }),
      getById: (postId: string) => client.get<PostDetail>(`/posts/${encodeId(postId)}`),
      create: (input: CreatePostInput) =>
        client.post<PostDetail>("/posts", {
          body: input,
        }),
      update: (postId: string, input: UpdatePostInput) =>
        client.patch<PostDetail>(`/posts/${encodeId(postId)}`, {
          body: input,
        }),
      remove: (postId: string) => client.delete<PostDetail>(`/posts/${encodeId(postId)}`),
      updateStatus: (postId: string, input: UpdatePostStatusInput) =>
        client.patch<PostDetail>(`/posts/${encodeId(postId)}/status`, {
          body: input,
        }),
      updatePin: (postId: string, input: UpdatePostPinInput) =>
        client.patch<PostDetail>(`/posts/${encodeId(postId)}/pin`, {
          body: input,
        }),
      like: (postId: string) => client.post<LikeResponse>(`/posts/${encodeId(postId)}/like`),
      unlike: (postId: string) => client.delete<LikeResponse>(`/posts/${encodeId(postId)}/like`),
      save: (postId: string) => client.post<SaveResponse>(`/posts/${encodeId(postId)}/save`),
      unsave: (postId: string) => client.delete<SaveResponse>(`/posts/${encodeId(postId)}/save`),
    },
    comments: {
      listTree: (postId: string) =>
        client.get<CommentNode[]>(`/posts/${encodeId(postId)}/comments`),
      createOnPost: (postId: string, input: CreateCommentInput) =>
        client.post<CommentNode>(`/posts/${encodeId(postId)}/comments`, {
          body: input,
        }),
      createReply: (commentId: string, input: CreateCommentInput) =>
        client.post<CommentNode>(`/comments/${encodeId(commentId)}/replies`, {
          body: input,
        }),
      update: (commentId: string, input: UpdateCommentInput) =>
        client.patch<CommentNode>(`/comments/${encodeId(commentId)}`, {
          body: input,
        }),
      remove: (commentId: string) => client.delete<CommentNode>(`/comments/${encodeId(commentId)}`),
      like: (commentId: string) =>
        client.post<LikeResponse>(`/comments/${encodeId(commentId)}/like`),
      unlike: (commentId: string) =>
        client.delete<LikeResponse>(`/comments/${encodeId(commentId)}/like`),
    },
    savedPosts: {
      listMine: (query?: PaginationQuery) =>
        client.get<PaginatedResponse<SavedPostListItem>>("/me/saved-posts", {
          query: toPaginationQuery(query),
        }),
    },
    users: {
      getProfile: (userId: string) => client.get<UserProfile>(`/users/${encodeId(userId)}`),
      listFollowers: (userId: string, query?: PaginationQuery) =>
        client.get<PaginatedResponse<UserSummary>>(`/users/${encodeId(userId)}/followers`, {
          query: toPaginationQuery(query),
        }),
      listFollowing: (userId: string, query?: PaginationQuery) =>
        client.get<PaginatedResponse<UserSummary>>(`/users/${encodeId(userId)}/following`, {
          query: toPaginationQuery(query),
        }),
      getRelationship: (userId: string) =>
        client.get<RelationshipResponse>(`/users/${encodeId(userId)}/relationship`),
      follow: (userId: string) => client.post<FollowResponse>(`/users/${encodeId(userId)}/follow`),
      unfollow: (userId: string) =>
        client.delete<FollowResponse>(`/users/${encodeId(userId)}/follow`),
    },
    notificationsAdmin: {
      processPending: () =>
        client.post<ProcessNotificationsResponse>("/internal/notifications/process"),
    },
  };
}

export type ForumApi = ReturnType<typeof createForumApi>;