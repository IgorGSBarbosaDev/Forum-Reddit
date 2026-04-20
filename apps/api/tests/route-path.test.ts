import test from "node:test";
import assert from "node:assert/strict";

import { ApiRoutes } from "@forum-reddit/routes";

import { createChildRoute } from "../src/routes/route-path";

test("createChildRoute returns root for an exact mount path", () => {
  assert.equal(createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.root), "/");
});

test("createChildRoute creates a router-local path for mounted route contracts", () => {
  assert.equal(createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.byId()), "/:postId");
  assert.equal(createChildRoute(ApiRoutes.posts.root, ApiRoutes.posts.status()), "/:postId/status");
  assert.equal(createChildRoute(ApiRoutes.users.root, ApiRoutes.users.relationship()), "/:userId/relationship");
  assert.equal(
    createChildRoute(ApiRoutes.notificationsAdmin.root, ApiRoutes.notificationsAdmin.process),
    "/process",
  );
});

test("createChildRoute rejects route contracts outside the mount path", () => {
  assert.throws(
    () => createChildRoute(ApiRoutes.posts.root, ApiRoutes.users.byId()),
    /is not mounted below/,
  );
});
