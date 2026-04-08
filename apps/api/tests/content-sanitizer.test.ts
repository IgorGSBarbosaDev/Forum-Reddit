import test from "node:test";
import assert from "node:assert/strict";

import { PostStatus, UserStatus } from "@prisma/client";

import { REMOVED_COMMENT_CONTENT, REMOVED_POST_TITLE } from "../src/constants/forum";
import { acceptsComments, sanitizeAuthor, sanitizeCommentPublicContent, sanitizePostPublicContent } from "../src/utils/content-sanitizer";

test("sanitizeAuthor hides removed users", () => {
  const result = sanitizeAuthor({
    id: "user-1",
    username: "alice",
    displayName: "Alice",
    status: UserStatus.REMOVED,
    removedAt: new Date(),
  });

  assert.equal(result, null);
});

test("sanitizePostPublicContent hides deleted post content", () => {
  const result = sanitizePostPublicContent({
    title: "Original title",
    content: "Original content",
    deletedAt: new Date(),
  });

  assert.deepEqual(result, {
    title: REMOVED_POST_TITLE,
    content: null,
  });
});

test("sanitizeCommentPublicContent returns removed placeholder", () => {
  const result = sanitizeCommentPublicContent({
    content: "Original comment",
    deletedAt: new Date(),
  });

  assert.equal(result, REMOVED_COMMENT_CONTENT);
});

test("acceptsComments only returns true for active non-deleted posts", () => {
  assert.equal(acceptsComments(PostStatus.ACTIVE, null), true);
  assert.equal(acceptsComments(PostStatus.BLOCKED, null), false);
  assert.equal(acceptsComments(PostStatus.ARCHIVED, null), false);
  assert.equal(acceptsComments(PostStatus.ACTIVE, new Date()), false);
});
