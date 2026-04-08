import type { Prisma } from "@prisma/client";

import { sanitizeAuthor, sanitizePostPublicContent } from "../../utils/content-sanitizer";
import type { SavedPostListItemDto } from "./types";

type SavedPostRecord = Prisma.PromiseReturnType<
  import("./repository").SavedPostsRepository["findSavedPosts"]
>[number];

const CONTENT_PREVIEW_LENGTH = 280;

function createContentPreview(content: string | null) {
  if (!content) {
    return null;
  }

  return content.length > CONTENT_PREVIEW_LENGTH
    ? `${content.slice(0, CONTENT_PREVIEW_LENGTH).trimEnd()}...`
    : content;
}

export function mapSavedPost(record: SavedPostRecord): SavedPostListItemDto {
  const post = record.post;
  const sanitizedContent = sanitizePostPublicContent(post);

  return {
    id: post.id,
    title: sanitizedContent.title,
    contentPreview: createContentPreview(sanitizedContent.content),
    author: sanitizeAuthor(post.author, post.deletedAt !== null),
    status: post.status,
    isPinned: post.isPinned,
    commentsCount: post._count.comments,
    likesCount: post._count.likes,
    likedByMe: post.likes.length > 0,
    savedByMe: true,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    savedAt: record.createdAt,
  };
}
