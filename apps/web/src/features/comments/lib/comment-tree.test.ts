import { describe, expect, it } from "vitest";
import type { CommentNode } from "@forum-reddit/shared-types";

import { setCommentLikeState } from "./comment-tree";

function makeComment(overrides: Partial<CommentNode> & Pick<CommentNode, "id">): CommentNode {
  return {
    id: overrides.id,
    postId: overrides.postId ?? "post-1",
    parentId: overrides.parentId ?? null,
    depth: overrides.depth ?? 0,
    content: overrides.content ?? "Sample comment",
    author: overrides.author ?? {
      id: "user-1",
      username: "user.one",
      displayName: "User One",
    },
    wasEdited: overrides.wasEdited ?? false,
    editCount: overrides.editCount ?? 0,
    lastEditedAt: overrides.lastEditedAt ?? null,
    deletedAt: overrides.deletedAt ?? null,
    likesCount: overrides.likesCount ?? 0,
    likedByMe: overrides.likedByMe ?? false,
    createdAt: overrides.createdAt ?? "2026-01-01T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-01-01T10:00:00.000Z",
    replies: overrides.replies ?? [],
  };
}

describe("setCommentLikeState", () => {
  it("updates nested comment like state", () => {
    const reply = makeComment({ id: "comment-2", parentId: "comment-1", depth: 1, likesCount: 2 });
    const root = makeComment({ id: "comment-1", replies: [reply] });
    const tree = [root];

    const updatedTree = setCommentLikeState(tree, "comment-2", true);

    expect(updatedTree[0].replies[0].likedByMe).toBe(true);
    expect(updatedTree[0].replies[0].likesCount).toBe(3);
    expect(tree[0].replies[0].likedByMe).toBe(false);
  });

  it("returns the same reference when comment id does not exist", () => {
    const tree = [makeComment({ id: "comment-1" })];

    const updatedTree = setCommentLikeState(tree, "missing-comment", true);

    expect(updatedTree).toBe(tree);
  });
});
