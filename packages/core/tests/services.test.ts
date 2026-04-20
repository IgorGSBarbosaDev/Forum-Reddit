import test from "node:test";
import assert from "node:assert/strict";

import { PostStatus, UserStatus } from "@prisma/client";
import {
  BusinessRuleError,
  CommentsService,
  FollowsService,
  ForbiddenError,
  MAX_COMMENT_DEPTH,
  NotFoundError,
  PostsService,
  ReactionsService,
  SavedPostsService,
  UsersService,
} from "@forum-reddit/core";

const now = new Date("2026-04-08T10:00:00.000Z");

function createGuard() {
  const calls: string[] = [];

  return {
    calls,
    guard: {
      assertActiveUser: async (userId: string) => {
        calls.push(userId);
      },
    },
  };
}

function createPostRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "post-1",
    title: "Hello forum",
    content: "Body",
    status: PostStatus.ACTIVE,
    isPinned: false,
    wasEdited: false,
    editCount: 0,
    lastEditedAt: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    authorId: "user-1",
    author: {
      id: "user-1",
      username: "alice",
      displayName: "Alice",
      status: UserStatus.ACTIVE,
      removedAt: null,
    },
    _count: {
      comments: 2,
      likes: 3,
    },
    likes: [],
    saves: [],
    ...overrides,
  };
}

function createCommentRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "comment-1",
    postId: "post-1",
    parentId: null,
    depth: 0,
    content: "Comment body",
    wasEdited: false,
    editCount: 0,
    lastEditedAt: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    author: {
      id: "user-1",
      username: "alice",
      displayName: "Alice",
      status: UserStatus.ACTIVE,
      removedAt: null,
    },
    _count: {
      likes: 1,
    },
    likes: [],
    ...overrides,
  };
}

function createUserRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    username: "alice",
    displayName: "Alice",
    bio: "About Alice",
    status: UserStatus.ACTIVE,
    removedAt: null,
    followers: [],
    _count: {
      followers: 4,
      following: 5,
    },
    ...overrides,
  };
}

test("PostsService lists posts with mapped pagination metadata", async () => {
  const { guard } = createGuard();
  const postsRepository = {
    findFeedPosts: async () => [createPostRecord({ likes: [{ id: "like-1" }] })],
    countFeedPosts: async () => 11,
  };
  const service = new PostsService({} as never, postsRepository as never, {} as never, guard);

  const result = await service.listPosts({ page: 2, limit: 5 }, "viewer-1");

  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].title, "Hello forum");
  assert.equal(result.data[0].likedByMe, true);
  assert.deepEqual(result.meta, { page: 2, limit: 5, total: 11, totalPages: 3 });
});

test("PostsService creates a post inside a transaction and emits a notification event", async () => {
  const { calls, guard } = createGuard();
  const tx = { transaction: true };
  const createdPosts: unknown[] = [];
  const events: unknown[] = [];
  const prisma = {
    $transaction: async (callback: (client: unknown) => Promise<unknown>) => callback(tx),
  };
  const postsRepository = {
    createPost: async (data: unknown, client: unknown) => {
      createdPosts.push({ data, client });
      return { id: "post-1" };
    },
    findPostById: async () => createPostRecord(),
  };
  const notificationEventsRepository = {
    createPostPublishedEvent: async (actorId: string, postId: string, client: unknown) => {
      events.push({ actorId, postId, client });
    },
  };
  const service = new PostsService(
    prisma as never,
    postsRepository as never,
    notificationEventsRepository as never,
    guard,
  );

  const result = await service.createPost({ title: "Hello forum", content: "Body" }, "user-1");

  assert.deepEqual(calls, ["user-1"]);
  assert.deepEqual(createdPosts, [
    {
      data: { authorId: "user-1", title: "Hello forum", content: "Body" },
      client: tx,
    },
  ]);
  assert.deepEqual(events, [{ actorId: "user-1", postId: "post-1", client: tx }]);
  assert.equal(result.id, "post-1");
});

test("PostsService blocks edits from non-authors and deleted posts", async () => {
  const { guard } = createGuard();
  const postsRepository = {
    findPostStateById: async () => ({ id: "post-1", authorId: "other-user", status: PostStatus.ACTIVE, deletedAt: null }),
  };
  const service = new PostsService({} as never, postsRepository as never, {} as never, guard);

  await assert.rejects(
    service.updatePost("post-1", { title: "Edited" }, "user-1"),
    (error) => error instanceof ForbiddenError,
  );

  const deletedRepository = {
    findPostStateById: async () => ({ id: "post-1", authorId: "user-1", status: PostStatus.ACTIVE, deletedAt: now }),
  };
  const deletedService = new PostsService({} as never, deletedRepository as never, {} as never, guard);

  await assert.rejects(
    deletedService.updatePost("post-1", { title: "Edited" }, "user-1"),
    (error) => error instanceof Error && error.message === "Deleted posts cannot be edited.",
  );
});

test("CommentsService creates replies with bounded nesting depth", async () => {
  const { guard } = createGuard();
  const createdComments: unknown[] = [];
  const commentsRepository = {
    findCommentState: async () => ({
      id: "parent-1",
      postId: "post-1",
      parentId: null,
      authorId: "user-2",
      depth: 1,
      deletedAt: null,
    }),
    findPostState: async () => ({ id: "post-1", status: PostStatus.ACTIVE, deletedAt: null }),
    createComment: async (data: unknown) => {
      createdComments.push(data);
      return { id: "comment-1" };
    },
    findCommentById: async () => createCommentRecord({ id: "comment-1", parentId: "parent-1", depth: 2 }),
  };
  const service = new CommentsService(commentsRepository as never, guard);

  const result = await service.createReply("parent-1", { content: "Reply" }, "user-1");

  assert.equal(result.parentId, "parent-1");
  assert.equal(result.depth, 2);
  assert.deepEqual(createdComments, [
    { postId: "post-1", parentId: "parent-1", authorId: "user-1", content: "Reply", depth: 2 },
  ]);

  const maxDepthService = new CommentsService(
    {
      ...commentsRepository,
      findCommentState: async () => ({
        id: "deep-parent",
        postId: "post-1",
        parentId: "parent-2",
        authorId: "user-2",
        depth: MAX_COMMENT_DEPTH,
        deletedAt: null,
      }),
    } as never,
    guard,
  );

  await assert.rejects(
    maxDepthService.createReply("deep-parent", { content: "Too deep" }, "user-1"),
    (error) => error instanceof BusinessRuleError && error.code === "MAX_COMMENT_DEPTH_EXCEEDED",
  );
});

test("CommentsService rejects new comments on non-commentable posts", async () => {
  const { guard } = createGuard();
  let createCalled = false;
  const commentsRepository = {
    findPostState: async () => ({ id: "post-1", status: PostStatus.ARCHIVED, deletedAt: null }),
    createComment: async () => {
      createCalled = true;
      return { id: "comment-1" };
    },
  };
  const service = new CommentsService(commentsRepository as never, guard);

  await assert.rejects(
    service.createRootComment("post-1", { content: "Blocked" }, "user-1"),
    (error) => error instanceof BusinessRuleError && error.code === "POST_NOT_COMMENTABLE",
  );
  assert.equal(createCalled, false);
});

test("CommentsService only allows authors to edit and delete comments", async () => {
  const { guard } = createGuard();
  const commentsRepository = {
    findCommentState: async () => ({
      id: "comment-1",
      postId: "post-1",
      parentId: null,
      authorId: "other-user",
      depth: 0,
      deletedAt: null,
    }),
  };
  const service = new CommentsService(commentsRepository as never, guard);

  await assert.rejects(
    service.updateComment("comment-1", { content: "Edited" }, "user-1"),
    (error) => error instanceof ForbiddenError,
  );
  await assert.rejects(
    service.deleteComment("comment-1", "user-1"),
    (error) => error instanceof ForbiddenError,
  );
});

test("ReactionsService toggles post and comment likes after validating the actor and target", async () => {
  const { calls: guardCalls, guard } = createGuard();
  const repositoryCalls: string[] = [];
  const reactionsRepository = {
    ensurePostExists: async (postId: string) => repositoryCalls.push(`ensure-post:${postId}`),
    createPostLike: async (postId: string, userId: string) => repositoryCalls.push(`like-post:${postId}:${userId}`),
    deletePostLike: async (postId: string, userId: string) => repositoryCalls.push(`unlike-post:${postId}:${userId}`),
    ensureCommentExists: async (commentId: string) => repositoryCalls.push(`ensure-comment:${commentId}`),
    createCommentLike: async (commentId: string, userId: string) => repositoryCalls.push(`like-comment:${commentId}:${userId}`),
    deleteCommentLike: async (commentId: string, userId: string) =>
      repositoryCalls.push(`unlike-comment:${commentId}:${userId}`),
  };
  const service = new ReactionsService(reactionsRepository as never, guard);

  assert.deepEqual(await service.likePost("post-1", "user-1"), { liked: true });
  assert.deepEqual(await service.unlikePost("post-1", "user-1"), { liked: false });
  assert.deepEqual(await service.likeComment("comment-1", "user-1"), { liked: true });
  assert.deepEqual(await service.unlikeComment("comment-1", "user-1"), { liked: false });
  assert.deepEqual(guardCalls, ["user-1", "user-1", "user-1", "user-1"]);
  assert.deepEqual(repositoryCalls, [
    "ensure-post:post-1",
    "like-post:post-1:user-1",
    "ensure-post:post-1",
    "unlike-post:post-1:user-1",
    "ensure-comment:comment-1",
    "like-comment:comment-1:user-1",
    "ensure-comment:comment-1",
    "unlike-comment:comment-1:user-1",
  ]);
});

test("SavedPostsService saves, unsaves, and paginates saved posts", async () => {
  const { guard } = createGuard();
  const repositoryCalls: string[] = [];
  const savedPostsRepository = {
    ensurePostExists: async (postId: string) => repositoryCalls.push(`ensure:${postId}`),
    savePost: async (postId: string, userId: string) => repositoryCalls.push(`save:${postId}:${userId}`),
    unsavePost: async (postId: string, userId: string) => repositoryCalls.push(`unsave:${postId}:${userId}`),
    findSavedPosts: async () => [{ createdAt: now, post: createPostRecord({ saves: [{ id: "save-1" }] }) }],
    countSavedPosts: async () => 6,
  };
  const service = new SavedPostsService(savedPostsRepository as never, guard);

  assert.deepEqual(await service.savePost("post-1", "user-1"), { saved: true });
  assert.deepEqual(await service.unsavePost("post-1", "user-1"), { saved: false });

  const result = await service.listSavedPosts("user-1", 2, 5);

  assert.deepEqual(repositoryCalls, ["ensure:post-1", "save:post-1:user-1", "ensure:post-1", "unsave:post-1:user-1"]);
  assert.equal(result.data[0].savedByMe, true);
  assert.deepEqual(result.meta, { page: 2, limit: 5, total: 6, totalPages: 2 });
});

test("FollowsService follows and unfollows target users through the repository", async () => {
  const { guard } = createGuard();
  const repositoryCalls: string[] = [];
  const followsRepository = {
    ensureTargetUserExists: async (userId: string) => repositoryCalls.push(`ensure:${userId}`),
    createFollow: async (currentUserId: string, targetUserId: string) =>
      repositoryCalls.push(`follow:${currentUserId}:${targetUserId}`),
    deleteFollow: async (currentUserId: string, targetUserId: string) =>
      repositoryCalls.push(`unfollow:${currentUserId}:${targetUserId}`),
  };
  const service = new FollowsService(followsRepository as never, guard);

  assert.deepEqual(await service.followUser("target-1", "user-1"), { following: true });
  assert.deepEqual(await service.unfollowUser("target-1", "user-1"), { following: false });
  assert.deepEqual(repositoryCalls, [
    "ensure:target-1",
    "follow:user-1:target-1",
    "ensure:target-1",
    "unfollow:user-1:target-1",
  ]);
});

test("UsersService maps profiles, paginated followers, and relationship state", async () => {
  const { guard } = createGuard();
  const usersRepository = {
    findProfile: async (userId: string) => createUserRecord({ id: userId, followers: [{ id: "follow-1" }] }),
    listFollowers: async () => [{ follower: createUserRecord({ id: "follower-1", followers: [] }) }],
    countFollowers: async () => 1,
    listFollowing: async () => [{ following: createUserRecord({ id: "following-1", followers: [{ id: "follow-2" }] }) }],
    countFollowing: async () => 1,
    findRelationship: async () => ({ id: "relationship-1" }),
  };
  const service = new UsersService(usersRepository as never, guard);

  const profile = await service.getProfile("user-1", "viewer-1");
  const followers = await service.listFollowers("user-1", "viewer-1", 1, 10);
  const following = await service.listFollowing("user-1", "viewer-1", 1, 10);
  const relationship = await service.getRelationship("user-1", "viewer-1");

  assert.equal(profile.following, true);
  assert.equal(followers.data[0].id, "follower-1");
  assert.equal(following.data[0].following, true);
  assert.deepEqual(followers.meta, { page: 1, limit: 10, total: 1, totalPages: 1 });
  assert.deepEqual(relationship, { following: true });
});

test("UsersService raises not found for missing profiles", async () => {
  const { guard } = createGuard();
  const usersRepository = {
    findProfile: async () => null,
  };
  const service = new UsersService(usersRepository as never, guard);

  await assert.rejects(
    service.getProfile("missing-user"),
    (error) => error instanceof NotFoundError && error.code === "USER_NOT_FOUND",
  );
});
