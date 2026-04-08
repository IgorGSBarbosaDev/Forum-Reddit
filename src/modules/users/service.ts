import { NotFoundError } from "../../errors/not-found-error";
import { createPaginationMeta } from "../../utils/pagination";
import { mapFollower, mapFollowing, mapUserProfile } from "./mapper";
import { UsersRepository } from "./repository";

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string, currentUserId?: string) {
    const user = await this.usersRepository.findProfile(userId, currentUserId);

    if (!user) {
      throw new NotFoundError("User not found.", "USER_NOT_FOUND");
    }

    return mapUserProfile(user);
  }

  async listFollowers(userId: string, currentUserId: string | undefined, page: number, limit: number) {
    await this.getProfile(userId, currentUserId);

    const [followers, total] = await Promise.all([
      this.usersRepository.listFollowers(userId, currentUserId, page, limit),
      this.usersRepository.countFollowers(userId),
    ]);

    return {
      data: followers.map((entry) => mapFollower(entry.follower)),
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async listFollowing(userId: string, currentUserId: string | undefined, page: number, limit: number) {
    await this.getProfile(userId, currentUserId);

    const [following, total] = await Promise.all([
      this.usersRepository.listFollowing(userId, currentUserId, page, limit),
      this.usersRepository.countFollowing(userId),
    ]);

    return {
      data: following.map((entry) => mapFollowing(entry.following)),
      meta: createPaginationMeta(page, limit, total),
    };
  }

  async getRelationship(userId: string, currentUserId: string) {
    await this.getProfile(userId, currentUserId);
    const relationship = await this.usersRepository.findRelationship(userId, currentUserId);

    return {
      following: Boolean(relationship),
    };
  }

  async removeUser(userId: string) {
    await this.getProfile(userId);
    await this.usersRepository.removeUser(userId);
  }
}
