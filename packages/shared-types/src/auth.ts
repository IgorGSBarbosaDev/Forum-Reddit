export type UserRole = "user" | "moderator" | "admin";

export type MeResponse = {
  currentUserId: string;
  role: UserRole;
};