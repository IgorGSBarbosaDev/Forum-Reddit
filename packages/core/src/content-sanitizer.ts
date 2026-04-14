import { UserStatus, type PostStatus } from "@prisma/client";

import { COMMENTABLE_POST_STATUSES, REMOVED_COMMENT_CONTENT, REMOVED_POST_TITLE } from "./forum";

type AuthorShape = {
  id: string;
  username: string;
  displayName: string;
  status?: UserStatus;
  removedAt?: Date | null;
} | null;

export function sanitizeAuthor(author: AuthorShape, isContentRemoved = false) {
  if (!author || isContentRemoved) {
    return null;
  }

  if (author.status === UserStatus.REMOVED || author.removedAt !== null) {
    return null;
  }

  return {
    id: author.id,
    username: author.username,
    displayName: author.displayName,
  };
}

export function sanitizePostPublicContent(post: {
  title: string;
  content: string | null;
  deletedAt: Date | null;
}) {
  if (post.deletedAt) {
    return {
      title: REMOVED_POST_TITLE,
      content: null,
    };
  }

  return {
    title: post.title,
    content: post.content,
  };
}

export function sanitizeCommentPublicContent(comment: {
  content: string | null;
  deletedAt: Date | null;
}) {
  if (comment.deletedAt) {
    return REMOVED_COMMENT_CONTENT;
  }

  return comment.content ?? "";
}

export function acceptsComments(status: PostStatus, deletedAt: Date | null) {
  return deletedAt === null && COMMENTABLE_POST_STATUSES.includes(status);
}
