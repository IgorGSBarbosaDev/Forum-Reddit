import { paginationQuerySchema, userIdParamsSchema } from "./common";

export type UserSummary = {
  id: string;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  following: boolean;
};

export type UserProfile = UserSummary & {
  followersCount: number;
  followingCount: number;
};

export type RelationshipResponse = {
  following: boolean;
};

export type FollowResponse = {
  following: boolean;
};

export const userProfileParamsSchema = userIdParamsSchema;
export const userListQuerySchema = paginationQuerySchema;
