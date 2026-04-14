import type { ActiveUserGuard } from "../guards";
import { ReactionsRepository } from "./repository";

export class ReactionsService {
  constructor(
    private readonly reactionsRepository: ReactionsRepository,
    private readonly currentUserGuard: ActiveUserGuard,
  ) {}

  async likePost(postId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.reactionsRepository.ensurePostExists(postId);
    await this.reactionsRepository.createPostLike(postId, currentUserId);
    return { liked: true };
  }

  async unlikePost(postId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.reactionsRepository.ensurePostExists(postId);
    await this.reactionsRepository.deletePostLike(postId, currentUserId);
    return { liked: false };
  }

  async likeComment(commentId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.reactionsRepository.ensureCommentExists(commentId);
    await this.reactionsRepository.createCommentLike(commentId, currentUserId);
    return { liked: true };
  }

  async unlikeComment(commentId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.reactionsRepository.ensureCommentExists(commentId);
    await this.reactionsRepository.deleteCommentLike(commentId, currentUserId);
    return { liked: false };
  }
}
