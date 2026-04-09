import test, { after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

import type { Express } from "express";
import request from "supertest";

import type { PrismaClient } from "@prisma/client";

import { createApiTestContext, ensureTestDatabase, resetTestDatabase } from "./helpers/test-db";

let prisma: PrismaClient;
let app: Express;

async function createUser(input: {
  id: string;
  username: string;
  email: string;
  displayName: string;
}) {
  return prisma.user.create({
    data: {
      id: input.id,
      username: input.username,
      email: input.email,
      displayName: input.displayName,
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

test("GET /api/health returns ok payload", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: "ok",
    service: "forum-reddit-api",
  });
});

test("GET /api/me requires authentication", async () => {
  const response = await request(app).get("/api/me");

  assert.equal(response.status, 401);
  assert.equal(response.body.code, "AUTHENTICATION_REQUIRED");
});

test("GET /api/me returns current user id and role", async () => {
  await createUser({
    id: "user-123",
    username: "user.123",
    email: "user.123@example.com",
    displayName: "User 123",
  });

  const response = await request(app)
    .get("/api/me")
    .set("x-user-id", "user-123")
    .set("x-user-role", "moderator");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    currentUserId: "user-123",
    role: "moderator",
  });
});

test("GET /api/me rejects unknown authenticated users", async () => {
  const response = await request(app)
    .get("/api/me")
    .set("x-user-id", "ghost-user");

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "CURRENT_USER_NOT_FOUND");
});

test("invalid auth header returns validation error", async () => {
  const response = await request(app)
    .get("/api/me")
    .set("x-user-id", "user-123")
    .set("x-user-role", "invalid-role");

  assert.equal(response.status, 400);
  assert.equal(response.body.code, "VALIDATION_ERROR");
});

test("unknown route returns route not found", async () => {
  const response = await request(app).get("/api/does-not-exist");

  assert.equal(response.status, 404);
  assert.equal(response.body.code, "ROUTE_NOT_FOUND");
});
