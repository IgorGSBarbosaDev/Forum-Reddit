import type { ForumApi } from "../../../shared/api/forum-api";

export function fetchCommentTree(api: ForumApi, postId: string) {
  return api.comments.listTree(postId);
}
