import test from "node:test";
import assert from "node:assert/strict";

import { UserStatus } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@forum-reddit/core";
import { CurrentUserGuard } from "@forum-reddit/auth";

const now = new Date("2026-04-08T10:00:00.000Z");

test("CurrentUserGuard accepts active users", async () => {
  const prisma = {
    user: {
      findUnique: async () => ({ id: "user-1", status: UserStatus.ACTIVE, removedAt: null }),
    },
  };

  await new CurrentUserGuard(prisma as never).assertActiveUser("user-1");
});

test("CurrentUserGuard rejects missing users", async () => {
  const prisma = {
    user: {
      findUnique: async () => null,
    },
  };

  await assert.rejects(
    new CurrentUserGuard(prisma as never).assertActiveUser("missing-user"),
    (error) => error instanceof NotFoundError && error.code === "CURRENT_USER_NOT_FOUND",
  );
});

test("CurrentUserGuard rejects removed users", async () => {
  const prisma = {
    user: {
      findUnique: async () => ({ id: "user-1", status: UserStatus.REMOVED, removedAt: now }),
    },
  };

  await assert.rejects(
    new CurrentUserGuard(prisma as never).assertActiveUser("user-1"),
    (error) => error instanceof ForbiddenError,
  );
});
