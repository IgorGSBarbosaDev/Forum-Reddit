import type { Prisma } from "@prisma/client";

import { acceptsComments, sanitizeAuthor, sanitizePostPublicContent } from "../../utils/content-sanitizer";
import type { PostDetailDto, PostSummaryDto } from "./types";

const CONTENT_PREVIEW_LENGTH = 280;

type FeedPostRecord = Prisma.PromiseReturnType<
  import("./repository").PostsRepository["findFeedPosts"]
>[number];

type PostRecord = NonNullable<
  Prisma.PromiseReturnType<import("./repository").PostsRepository["findPostById"]>
>;

function createContentPreview(content: string | null) {
  if (!content) {
    return null;
  }

  const trimmedContent = content.trim();

  if (trimmedContent.length <= CONTENT_PREVIEW_LENGTH) {
    return trimmedContent;
  }

  return `${trimmedContent.slice(0, CONTENT_PREVIEW_LENGTH).trimEnd()}...`;
}

export function mapPostListItem(post: FeedPostRecord): PostSummaryDto {
  const sanitizedContent = sanitizePostPublicContent(post);
  const author = sanitizeAuthor(post.author, post.deletedAt !== null);

  return {
    id: post.id,
    title: sanitizedContent.title,
    contentPreview: createContentPreview(sanitizedContent.content),
    author,
    status: post.status,
    isPinned: post.isPinned,
    commentsCount: post._count.comments,
    likesCount: post._count.likes,
    likedByMe: Array.isArray(post.likes) && post.likes.length > 0,
    savedByMe: Array.isArray(post.saves) && post.saves.length > 0,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

export function mapPostDetail(post: PostRecord): PostDetailDto {
  const sanitizedContent = sanitizePostPublicContent(post);
  const author = sanitizeAuthor(post.author, post.deletedAt !== null);

  return {
    id: post.id,
    title: sanitizedContent.title,
    content: sanitizedContent.content,
    author,
    status: post.status,
    isPinned: post.isPinned,
    wasEdited: post.wasEdited,
    editCount: post.editCount,
    lastEditedAt: post.lastEditedAt,
    deletedAt: post.deletedAt,
    commentsCount: post._count.comments,
    likesCount: post._count.likes,
    likedByMe: Array.isArray(post.likes) && post.likes.length > 0,
    savedByMe: Array.isArray(post.saves) && post.saves.length > 0,
    acceptsComments: acceptsComments(post.status, post.deletedAt),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
