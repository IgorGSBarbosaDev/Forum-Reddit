import type { ActiveUserGuard } from "../guards";
import { FollowsRepository } from "./repository";

export class FollowsService {
  constructor(
    private readonly followsRepository: FollowsRepository,
    private readonly currentUserGuard: ActiveUserGuard,
  ) {}

  async followUser(targetUserId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.followsRepository.ensureTargetUserExists(targetUserId);
    await this.followsRepository.createFollow(currentUserId, targetUserId);
    return { following: true };
  }

  async unfollowUser(targetUserId: string, currentUserId: string) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    await this.followsRepository.ensureTargetUserExists(targetUserId);
    await this.followsRepository.deleteFollow(currentUserId, targetUserId);
    return { following: false };
  }
}
