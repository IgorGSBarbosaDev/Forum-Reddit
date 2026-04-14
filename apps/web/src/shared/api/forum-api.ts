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
} from "@forum-reddit/types";
import { ApiRoutes } from "@forum-reddit/routes";

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
      getHealth: () => client.get<HealthResponse>(ApiRoutes.health),
      getMe: () => client.get<MeResponse>(ApiRoutes.me),
    },
    posts: {
      list: (query: ListPostsQuery = {}) => client.get<PaginatedResponse<PostSummary>>(ApiRoutes.posts.root, { query }),
      getById: (postId: string) => client.get<PostDetail>(ApiRoutes.posts.byId(encodeId(postId))),
      create: (input: CreatePostInput) =>
        client.post<PostDetail>(ApiRoutes.posts.root, {
          body: input,
        }),
      update: (postId: string, input: UpdatePostInput) =>
        client.patch<PostDetail>(ApiRoutes.posts.byId(encodeId(postId)), {
          body: input,
        }),
      remove: (postId: string) => client.delete<PostDetail>(ApiRoutes.posts.byId(encodeId(postId))),
      updateStatus: (postId: string, input: UpdatePostStatusInput) =>
        client.patch<PostDetail>(ApiRoutes.posts.status(encodeId(postId)), {
          body: input,
        }),
      updatePin: (postId: string, input: UpdatePostPinInput) =>
        client.patch<PostDetail>(ApiRoutes.posts.pin(encodeId(postId)), {
          body: input,
        }),
      like: (postId: string) => client.post<LikeResponse>(ApiRoutes.posts.like(encodeId(postId))),
      unlike: (postId: string) => client.delete<LikeResponse>(ApiRoutes.posts.like(encodeId(postId))),
      save: (postId: string) => client.post<SaveResponse>(ApiRoutes.posts.save(encodeId(postId))),
      unsave: (postId: string) => client.delete<SaveResponse>(ApiRoutes.posts.save(encodeId(postId))),
    },
    comments: {
      listTree: (postId: string) => client.get<CommentNode[]>(ApiRoutes.posts.comments(encodeId(postId))),
      createOnPost: (postId: string, input: CreateCommentInput) =>
        client.post<CommentNode>(ApiRoutes.posts.comments(encodeId(postId)), {
          body: input,
        }),
      createReply: (commentId: string, input: CreateCommentInput) =>
        client.post<CommentNode>(ApiRoutes.comments.replies(encodeId(commentId)), {
          body: input,
        }),
      update: (commentId: string, input: UpdateCommentInput) =>
        client.patch<CommentNode>(ApiRoutes.comments.byId(encodeId(commentId)), {
          body: input,
        }),
      remove: (commentId: string) => client.delete<CommentNode>(ApiRoutes.comments.byId(encodeId(commentId))),
      like: (commentId: string) => client.post<LikeResponse>(ApiRoutes.comments.like(encodeId(commentId))),
      unlike: (commentId: string) => client.delete<LikeResponse>(ApiRoutes.comments.like(encodeId(commentId))),
    },
    savedPosts: {
      listMine: (query?: PaginationQuery) =>
        client.get<PaginatedResponse<SavedPostListItem>>(ApiRoutes.savedPosts.mine, {
          query: toPaginationQuery(query),
        }),
    },
    users: {
      getProfile: (userId: string) => client.get<UserProfile>(ApiRoutes.users.byId(encodeId(userId))),
      listFollowers: (userId: string, query?: PaginationQuery) =>
        client.get<PaginatedResponse<UserSummary>>(ApiRoutes.users.followers(encodeId(userId)), {
          query: toPaginationQuery(query),
        }),
      listFollowing: (userId: string, query?: PaginationQuery) =>
        client.get<PaginatedResponse<UserSummary>>(ApiRoutes.users.following(encodeId(userId)), {
          query: toPaginationQuery(query),
        }),
      getRelationship: (userId: string) =>
        client.get<RelationshipResponse>(ApiRoutes.users.relationship(encodeId(userId))),
      follow: (userId: string) => client.post<FollowResponse>(ApiRoutes.users.follow(encodeId(userId))),
      unfollow: (userId: string) =>
        client.delete<FollowResponse>(ApiRoutes.users.follow(encodeId(userId))),
    },
    notificationsAdmin: {
      processPending: () => client.post<ProcessNotificationsResponse>(ApiRoutes.notificationsAdmin.process),
    },
  };
}

export type ForumApi = ReturnType<typeof createForumApi>;
