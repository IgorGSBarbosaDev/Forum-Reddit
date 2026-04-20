import test from "node:test";
import assert from "node:assert/strict";

import { AuthenticationRequiredError, ForbiddenError, NotFoundError } from "@forum-reddit/core";

import { createRequireModerator } from "../src/middlewares/require-moderator";

function runMiddleware(request: unknown, guard: { assertActiveUser(currentUserId: string): Promise<void> }) {
  const middleware = createRequireModerator(guard);

  return new Promise<unknown>((resolve) => {
    middleware(request as never, {} as never, resolve as never);
  });
}

test("createRequireModerator rejects unauthenticated requests", async () => {
  const result = await runMiddleware({}, { assertActiveUser: async () => undefined });

  assert.equal(result instanceof AuthenticationRequiredError, true);
});

test("createRequireModerator validates the current user before accepting moderator roles", async () => {
  const result = await runMiddleware(
    { currentUser: { id: "ghost-moderator", role: "moderator" } },
    {
      assertActiveUser: async () => {
        throw new NotFoundError("Authenticated user not found.", "CURRENT_USER_NOT_FOUND");
      },
    },
  );

  assert.equal(result instanceof NotFoundError, true);
  assert.equal((result as NotFoundError).code, "CURRENT_USER_NOT_FOUND");
});

test("createRequireModerator rejects active non-moderator users", async () => {
  const result = await runMiddleware(
    { currentUser: { id: "user-1", role: "user" } },
    { assertActiveUser: async () => undefined },
  );

  assert.equal(result instanceof ForbiddenError, true);
});

test("createRequireModerator accepts active moderators", async () => {
  const result = await runMiddleware(
    { currentUser: { id: "moderator-1", role: "moderator" } },
    { assertActiveUser: async () => undefined },
  );

  assert.equal(result, undefined);
});
