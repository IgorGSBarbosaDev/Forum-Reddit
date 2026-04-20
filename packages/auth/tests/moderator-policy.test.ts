import test from "node:test";
import assert from "node:assert/strict";

import { AUTHORIZED_MODERATOR_ROLES, canModerate } from "@forum-reddit/auth";

test("canModerate only accepts moderator roles", () => {
  assert.deepEqual(AUTHORIZED_MODERATOR_ROLES, ["moderator", "admin"]);
  assert.equal(canModerate("user"), false);
  assert.equal(canModerate("moderator"), true);
  assert.equal(canModerate("admin"), true);
});
