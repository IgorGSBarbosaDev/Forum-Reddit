import { PostStatus } from "@prisma/client";

export const MAX_COMMENT_DEPTH = 3;

export const REMOVED_POST_TITLE = "[post removed]";
export const REMOVED_COMMENT_CONTENT = "[comment removed]";

export const FEED_VISIBLE_POST_STATUSES: PostStatus[] = [PostStatus.ACTIVE, PostStatus.BLOCKED];
export const COMMENTABLE_POST_STATUSES: PostStatus[] = [PostStatus.ACTIVE];
