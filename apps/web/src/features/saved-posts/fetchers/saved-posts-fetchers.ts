import type { PaginationQuery } from "../../../shared/api/forum-api";
import type { ForumApi } from "../../../shared/api/forum-api";

export function fetchSavedPosts(api: ForumApi, query: PaginationQuery) {
  return api.savedPosts.listMine(query);
}
