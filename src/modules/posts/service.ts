import type { PaginatedPostsResponse } from "./types";
import type { ListPostsQuery } from "./types";

import { PostsRepository } from "./repository";
import { mapPostListItem } from "./mapper";

export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) {}

  async listPosts(query: ListPostsQuery, currentUserId?: string): Promise<PaginatedPostsResponse> {
    const [posts, total] = await Promise.all([
      this.postsRepository.findFeedPosts(query, currentUserId),
      this.postsRepository.countFeedPosts(),
    ]);

    return {
      data: posts.map(mapPostListItem),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
