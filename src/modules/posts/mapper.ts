import { UserStatus, type Prisma } from "@prisma/client";

import type { PostListItem } from "./types";

const CONTENT_PREVIEW_LENGTH = 280;

type FeedPostRecord = Prisma.PromiseReturnType<
  import("./repository").PostsRepository["findFeedPosts"]
>[number];

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

export function mapPostListItem(post: FeedPostRecord): PostListItem {
  const author = post.author;
  const shouldHideAuthor =
    !author ||
    author.status === UserStatus.REMOVED ||
    author.removedAt !== null;

  return {
    id: post.id,
    title: post.title,
    contentPreview: createContentPreview(post.content),
    author: shouldHideAuthor
      ? null
      : {
          id: author.id,
          username: author.username,
          displayName: author.displayName,
        },
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
