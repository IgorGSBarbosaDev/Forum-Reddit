import test from "node:test";
import assert from "node:assert/strict";

import request from "supertest";

import { app } from "../src/app";

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
