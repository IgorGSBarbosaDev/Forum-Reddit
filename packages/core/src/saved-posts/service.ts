import { createPaginationMeta } from "../pagination";
import type { ActiveUserGuard } from "../guards";
import { mapSavedPost } from "./mapper";
import { SavedPostsRepository } from "./repository";

export class SavedPostsService {
  constructor(
    private readonly savedPostsRepository: SavedPostsRepository,
    private readonly currentUserGuard: ActiveUserGuard,
  ) {}

  async savePost(postId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.savedPostsRepository.ensurePostExists(postId);
    await this.savedPostsRepository.savePost(postId, currentUserId);
    return { saved: true };
  }

  async unsavePost(postId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.savedPostsRepository.ensurePostExists(postId);
    await this.savedPostsRepository.unsavePost(postId, currentUserId);
    return { saved: false };
  }

  async listSavedPosts(currentUserId: string, page: number, limit: number) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    const [items, total] = await Promise.all([
      this.savedPostsRepository.findSavedPosts(currentUserId, page, limit),
      this.savedPostsRepository.countSavedPosts(currentUserId),
    ]);

    return {
      data: items.map(mapSavedPost),
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
