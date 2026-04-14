import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

import type { Express } from "express";
import request from "supertest";

import { NotificationEventType, PostStatus, UserStatus, type PrismaClient } from "@prisma/client";

import { createApiTestContext, ensureTestDatabase, resetTestDatabase } from "./helpers/test-db";

let prisma: PrismaClient;
let app: Express;

async function createUser(input: {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status?: UserStatus;
}) {
  return prisma.user.create({
    data: {
      id: input.id,
      username: input.username,
      email: input.email,
      displayName: input.displayName,
      status: input.status ?? UserStatus.ACTIVE,
    },
  });
}

async function createPost(input: {
  id: string;
  authorId: string;
  title: string;
  content?: string;
  status?: PostStatus;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return prisma.post.create({
    data: {
      id: input.id,
      authorId: input.authorId,
      title: input.title,
      content: input.content ?? null,
      status: input.status ?? PostStatus.ACTIVE,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    },
  });
}

async function createComment(input: {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  depth: number;
  parentId?: string;
}) {
  return prisma.comment.create({
    data: {
      id: input.id,
      postId: input.postId,
      authorId: input.authorId,
      content: input.content,
      depth: input.depth,
      parentId: input.parentId ?? null,
    },
  });
}

before(async () => {
  await ensureTestDatabase();
});

beforeEach(async () => {
  await resetTestDatabase();

  if (prisma) {
    await prisma.$disconnect();
  }

  const context = await createApiTestContext();
  prisma = context.prisma;
  app = context.app;
});

after(async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

test("GET /api/posts paginates deterministically when createdAt ties", async () => {
  await createUser({
    id: "author-1",
    username: "author.one",
    email: "author.one@example.com",
    displayName: "Author One",
  });

  const sharedDate = new Date("2026-04-08T12:00:00.000Z");

  await createPost({
    id: "post-a",
    authorId: "author-1",
    title: "A",
    createdAt: sharedDate,
    updatedAt: sharedDate,
  });
  await createPost({
    id: "post-b",
    authorId: "author-1",
    title: "B",
    createdAt: sharedDate,
    updatedAt: sharedDate,
  });
  await createPost({
    id: "post-c",
    authorId: "author-1",
    title: "C",
    createdAt: sharedDate,
    updatedAt: sharedDate,
  });

  const pageOne = await request(app).get("/api/posts?page=1&limit=2&sortBy=createdAt&order=desc");
  const pageTwo = await request(app).get("/api/posts?page=2&limit=2&sortBy=createdAt&order=desc");

  assert.equal(pageOne.status, 200);
  assert.equal(pageTwo.status, 200);
  assert.deepEqual(pageOne.body.data.map((post: { id: string }) => post.id), ["post-c", "post-b"]);
  assert.deepEqual(pageTwo.body.data.map((post: { id: string }) => post.id), ["post-a"]);
});

test("DELETE /api/posts/:postId applies soft delete and removes post from feed", async () => {
  await createUser({
    id: "author-1",
    username: "author.one",
    email: "author.one@example.com",
    displayName: "Author One",
  });

  await createPost({
    id: "post-soft-delete",
    authorId: "author-1",
    title: "Soft delete me",
    content: "body",
  });

  const deleteResponse = await request(app)
    .delete("/api/posts/post-soft-delete")
    .set("x-user-id", "author-1");

  assert.equal(deleteResponse.status, 200);
  assert.equal(deleteResponse.body.title, "[post removed]");
  assert.equal(deleteResponse.body.author, null);
  assert.ok(deleteResponse.body.deletedAt);

  const feedResponse = await request(app).get("/api/posts");
  assert.equal(feedResponse.status, 200);
  assert.equal(feedResponse.body.data.length, 0);
});

test("POST /api/comments/:commentId/replies enforces maximum depth", async () => {
  await createUser({
    id: "author-1",
    username: "author.one",
    email: "author.one@example.com",
    displayName: "Author One",
  });
  await createUser({
    id: "author-2",
    username: "author.two",
    email: "author.two@example.com",
    displayName: "Author Two",
  });

  await createPost({
    id: "post-comments",
    authorId: "author-1",
    title: "Comments",
  });

  await createComment({
    id: "comment-root",
    postId: "post-comments",
    authorId: "author-1",
    content: "root",
    depth: 0,
  });
  await createComment({
    id: "comment-1",
    postId: "post-comments",
    authorId: "author-2",
    parentId: "comment-root",
    content: "depth-1",
    depth: 1,
  });
  await createComment({
    id: "comment-2",
    postId: "post-comments",
    authorId: "author-1",
    parentId: "comment-1",
    content: "depth-2",
    depth: 2,
  });
  await createComment({
    id: "comment-3",
    postId: "post-comments",
    authorId: "author-2",
    parentId: "comment-2",
    content: "depth-3",
    depth: 3,
  });

  const response = await request(app)
    .post("/api/comments/comment-3/replies")
    .set("x-user-id", "author-1")
    .send({ content: "too deep" });

  assert.equal(response.status, 422);
  assert.equal(response.body.code, "MAX_COMMENT_DEPTH_EXCEEDED");
});

test("interaction endpoints reject duplicate like, save, and follow requests", async () => {
  await createUser({
    id: "user-1",
    username: "user.one",
    email: "user.one@example.com",
    displayName: "User One",
  });
  await createUser({
    id: "user-2",
    username: "user.two",
    email: "user.two@example.com",
    displayName: "User Two",
  });

  await createPost({
    id: "post-1",
    authorId: "user-2",
    title: "Hello",
  });

  const firstLike = await request(app).post("/api/posts/post-1/like").set("x-user-id", "user-1");
  const duplicateLike = await request(app).post("/api/posts/post-1/like").set("x-user-id", "user-1");
  const firstSave = await request(app).post("/api/posts/post-1/save").set("x-user-id", "user-1");
  const duplicateSave = await request(app).post("/api/posts/post-1/save").set("x-user-id", "user-1");
  const firstFollow = await request(app).post("/api/users/user-2/follow").set("x-user-id", "user-1");
  const duplicateFollow = await request(app).post("/api/users/user-2/follow").set("x-user-id", "user-1");

  assert.equal(firstLike.status, 200);
  assert.equal(duplicateLike.status, 409);
  assert.equal(firstSave.status, 200);
  assert.equal(duplicateSave.status, 409);
  assert.equal(firstFollow.status, 200);
  assert.equal(duplicateFollow.status, 409);
});

test("GET /api/users/:userId/relationship rejects unknown authenticated users", async () => {
  await createUser({
    id: "target-user",
    username: "target.user",
    email: "target.user@example.com",
    displayName: "Target User",
  });

  const response = await request(app)
    .get("/api/users/target-user/relationship")
    .set("x-user-id", "ghost-user");

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "CURRENT_USER_NOT_FOUND");
});

test("POST /api/internal/notifications/process includes followers without explicit preferences", async () => {
  await createUser({
    id: "author-1",
    username: "author.one",
    email: "author.one@example.com",
    displayName: "Author One",
  });
  await createUser({
    id: "follower-default",
    username: "follower.default",
    email: "follower.default@example.com",
    displayName: "Follower Default",
  });
  await createUser({
    id: "follower-opt-out",
    username: "follower.optout",
    email: "follower.optout@example.com",
    displayName: "Follower Opt Out",
  });
  await createUser({
    id: "moderator-1",
    username: "moderator.one",
    email: "moderator.one@example.com",
    displayName: "Moderator One",
  });

  await prisma.follow.createMany({
    data: [
      {
        followerId: "follower-default",
        followingId: "author-1",
      },
      {
        followerId: "follower-opt-out",
        followingId: "author-1",
      },
    ],
  });

  await prisma.notificationPreference.create({
    data: {
      userId: "follower-opt-out",
      notifyOnFollowedPosts: false,
    },
  });

  const createdPost = await request(app)
    .post("/api/posts")
    .set("x-user-id", "author-1")
    .send({
      title: "New post",
      content: "Body",
    });

  assert.equal(createdPost.status, 201);

  const processResponse = await request(app)
    .post("/api/internal/notifications/process")
    .set("x-user-id", "moderator-1")
    .set("x-user-role", "moderator");

  assert.equal(processResponse.status, 200);
  assert.equal(processResponse.body.processedCount, 1);

  const event = await prisma.notificationEvent.findFirstOrThrow({
    where: {
      actorId: "author-1",
    },
  });

  const payload = event.payload as {
    recipientIds: string[];
    recipientCount: number;
    processedFrom: string;
  };

  assert.deepEqual(payload.recipientIds, ["follower-default"]);
  assert.equal(payload.recipientCount, 1);
  assert.equal(payload.processedFrom, "manual-worker");
  assert.ok(event.processedAt);
});

test("POST /api/internal/notifications/process rejects unknown moderators", async () => {
  const response = await request(app)
    .post("/api/internal/notifications/process")
    .set("x-user-id", "ghost-moderator")
    .set("x-user-role", "moderator");

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "CURRENT_USER_NOT_FOUND");
});

test("POST /api/internal/notifications/process is idempotent and skips fresh claims", async () => {
  await createUser({
    id: "author-claim",
    username: "author.claim",
    email: "author.claim@example.com",
    displayName: "Author Claim",
  });
  await createUser({
    id: "follower-claim",
    username: "follower.claim",
    email: "follower.claim@example.com",
    displayName: "Follower Claim",
  });
  await createUser({
    id: "moderator-claim",
    username: "moderator.claim",
    email: "moderator.claim@example.com",
    displayName: "Moderator Claim",
  });

  await prisma.follow.create({
    data: {
      followerId: "follower-claim",
      followingId: "author-claim",
    },
  });

  await prisma.notificationEvent.createMany({
    data: [
      {
        id: "event-unclaimed",
        type: NotificationEventType.POST_PUBLISHED,
        actorId: "author-claim",
      },
      {
        id: "event-fresh-claim",
        type: NotificationEventType.POST_PUBLISHED,
        actorId: "author-claim",
        claimedAt: new Date(),
        claimedBy: "other-worker",
      },
    ],
  });

  const firstProcess = await request(app)
    .post("/api/internal/notifications/process")
    .set("x-user-id", "moderator-claim")
    .set("x-user-role", "moderator");

  assert.equal(firstProcess.status, 200);
  assert.equal(firstProcess.body.processedCount, 1);

  const secondProcess = await request(app)
    .post("/api/internal/notifications/process")
    .set("x-user-id", "moderator-claim")
    .set("x-user-role", "moderator");

  assert.equal(secondProcess.status, 200);
  assert.equal(secondProcess.body.processedCount, 0);

  const processedEvent = await prisma.notificationEvent.findUniqueOrThrow({
    where: {
      id: "event-unclaimed",
    },
  });
  const freshClaimEvent = await prisma.notificationEvent.findUniqueOrThrow({
    where: {
      id: "event-fresh-claim",
    },
  });

  assert.ok(processedEvent.processedAt);
  assert.equal(processedEvent.claimedAt, null);
  assert.equal(processedEvent.claimedBy, null);
  assert.equal(freshClaimEvent.processedAt, null);
  assert.equal(freshClaimEvent.claimedBy, "other-worker");
});
