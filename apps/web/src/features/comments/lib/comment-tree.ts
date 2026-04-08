import type { CommentNode } from "@forum-reddit/shared-types";

type CommentUpdater = (comment: CommentNode) => CommentNode;

function patchNode(
  node: CommentNode,
  commentId: string,
  updater: CommentUpdater,
): { node: CommentNode; changed: boolean } {
  let nextNode = node;
  let changed = false;

  if (node.id === commentId) {
    const updatedNode = updater(node);

    if (updatedNode !== node) {
      nextNode = updatedNode;
      changed = true;
    }
  }

  if (nextNode.replies.length === 0) {
    return { node: nextNode, changed };
  }

  const nextReplies = patchCommentTree(nextNode.replies, commentId, updater);

  if (nextReplies !== nextNode.replies) {
    nextNode = {
      ...nextNode,
      replies: nextReplies,
    };
    changed = true;
  }

  return { node: nextNode, changed };
}

export function patchCommentTree(
  tree: CommentNode[],
  commentId: string,
  updater: CommentUpdater,
): CommentNode[] {
  let changed = false;

  const nextTree = tree.map((node) => {
    const result = patchNode(node, commentId, updater);
    if (result.changed) {
      changed = true;
    }

    return result.node;
  });

  return changed ? nextTree : tree;
}

export function setCommentLikeState(
  tree: CommentNode[],
  commentId: string,
  nextLikedByMe: boolean,
): CommentNode[] {
  return patchCommentTree(tree, commentId, (comment) => {
    if (comment.likedByMe === nextLikedByMe) {
      return comment;
    }

    return {
      ...comment,
      likedByMe: nextLikedByMe,
      likesCount: Math.max(0, comment.likesCount + (nextLikedByMe ? 1 : -1)),
    };
  });
}
