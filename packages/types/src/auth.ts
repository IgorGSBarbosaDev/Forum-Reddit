import { z } from "zod";

export type UserRole = "user" | "moderator" | "admin";

export type MeResponse = {
  currentUserId: string;
  role: UserRole;
};

export const userRoleSchema = z.enum(["user", "moderator", "admin"]);

export const meResponseSchema = z.object({
  currentUserId: z.string(),
  role: userRoleSchema,
});
