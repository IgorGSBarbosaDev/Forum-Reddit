export type UserSummaryDto = {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  following: boolean;
};

export type UserProfileDto = UserSummaryDto & {
  followersCount: number;
  followingCount: number;
};
