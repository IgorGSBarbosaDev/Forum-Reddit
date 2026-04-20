import test from "node:test";
import assert from "node:assert/strict";

import { buildCommentTree } from "@forum-reddit/core";

test("buildCommentTree nests replies under their parent", () => {
  const comments = [
    {
      id: "root",
      postId: "post-1",
      parentId: null,
      depth: 0,
      content: "Root",
      wasEdited: false,
      editCount: 0,
      lastEditedAt: null,
      deletedAt: null,
      createdAt: new Date("2026-04-08T10:00:00.000Z"),
      updatedAt: new Date("2026-04-08T10:00:00.000Z"),
      author: {
        id: "user-1",
        username: "alice",
        displayName: "Alice",
        status: "ACTIVE",
        removedAt: null,
      },
      _count: {
        likes: 0,
      },
      likes: [],
    },
    {
      id: "reply",
      postId: "post-1",
      parentId: "root",
      depth: 1,
      content: "Reply",
      wasEdited: false,
      editCount: 0,
      lastEditedAt: null,
      deletedAt: null,
      createdAt: new Date("2026-04-08T10:01:00.000Z"),
      updatedAt: new Date("2026-04-08T10:01:00.000Z"),
      author: {
        id: "user-2",
        username: "bob",
        displayName: "Bob",
        status: "ACTIVE",
        removedAt: null,
      },
      _count: {
        likes: 0,
      },
      likes: [],
    },
  ] as Parameters<typeof buildCommentTree>[0];

  const tree = buildCommentTree(comments);

  assert.equal(tree.length, 1);
  assert.equal(tree[0].id, "root");
  assert.equal(tree[0].replies.length, 1);
  assert.equal(tree[0].replies[0].id, "reply");
});
