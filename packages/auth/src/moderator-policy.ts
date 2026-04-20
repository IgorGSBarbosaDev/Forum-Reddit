import type { UserRole } from "@forum-reddit/types";

export const AUTHORIZED_MODERATOR_ROLES = ["moderator", "admin"] as const satisfies readonly UserRole[];

const authorizedModeratorRoles = new Set<UserRole>(AUTHORIZED_MODERATOR_ROLES);

export function canModerate(role: UserRole) {
  return authorizedModeratorRoles.has(role);
}
