import type { Prisma } from "@prisma/client";
import { UserStatus } from "@prisma/client";

import type { UserProfileDto, UserSummaryDto } from "./types";

type ProfileRecord = NonNullable<
  Prisma.PromiseReturnType<import("./repository").UsersRepository["findProfile"]>
>;

type FollowersRecord = Prisma.PromiseReturnType<
  import("./repository").UsersRepository["listFollowers"]
>[number]["follower"];

type FollowingRecord = Prisma.PromiseReturnType<
  import("./repository").UsersRepository["listFollowing"]
>[number]["following"];

function mapUserVisibility(user: {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  status: UserStatus;
  removedAt: Date | null;
  followers?: { id: string }[] | false;
}): UserSummaryDto {
  const removed = user.status === UserStatus.REMOVED || user.removedAt !== null;

  return {
    id: user.id,
    username: removed ? null : user.username,
    displayName: removed ? null : user.displayName,
    bio: removed ? null : user.bio,
    following: Array.isArray(user.followers) && user.followers.length > 0,
  };
}

export function mapUserProfile(user: ProfileRecord): UserProfileDto {
  return {
    ...mapUserVisibility(user),
    followersCount: user._count.followers,
    followingCount: user._count.following,
  };
}

export function mapFollower(user: FollowersRecord): UserSummaryDto {
  return mapUserVisibility(user);
}

export function mapFollowing(user: FollowingRecord): UserSummaryDto {
  return mapUserVisibility(user);
}
