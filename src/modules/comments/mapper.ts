import type { Prisma } from "@prisma/client";

import { sanitizeAuthor, sanitizeCommentPublicContent } from "../../utils/content-sanitizer";
import type { CommentNodeDto } from "./types";

type CommentRecord = NonNullable<
  Prisma.PromiseReturnType<import("./repository").CommentsRepository["findCommentById"]>
>;

type CommentListRecord = Prisma.PromiseReturnType<
  import("./repository").CommentsRepository["findCommentsByPostId"]
>[number];

export function mapCommentNode(comment: CommentRecord | CommentListRecord): CommentNodeDto {
  return {
    id: comment.id,
    postId: comment.postId,
    parentId: comment.parentId,
    depth: comment.depth,
    content: sanitizeCommentPublicContent(comment),
    author: sanitizeAuthor(comment.author, comment.deletedAt !== null),
    wasEdited: comment.wasEdited,
    editCount: comment.editCount,
    lastEditedAt: comment.lastEditedAt,
    deletedAt: comment.deletedAt,
    likesCount: comment._count.likes,
    likedByMe: Array.isArray(comment.likes) && comment.likes.length > 0,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replies: [],
  };
}

export function buildCommentTree(comments: CommentListRecord[]) {
  const nodes = comments.map(mapCommentNode);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: CommentNodeDto[] = [];

  for (const node of nodes) {
    if (!node.parentId) {
      roots.push(node);
      continue;
    }

    const parent = byId.get(node.parentId);

    if (!parent) {
      roots.push(node);
      continue;
    }

    parent.replies.push(node);
  }

  return roots;
}
