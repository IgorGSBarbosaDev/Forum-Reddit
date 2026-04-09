import { UserStatus, type PrismaClient } from "@prisma/client";

import { ForbiddenError } from "../../errors/forbidden-error";
import { NotFoundError } from "../../errors/not-found-error";

export class CurrentUserGuard {
  constructor(private readonly prisma: PrismaClient) {}

  async assertActiveUser(currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
      select: {
        id: true,
        status: true,
        removedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("Authenticated user not found.", "CURRENT_USER_NOT_FOUND");
    }

    if (user.status !== UserStatus.ACTIVE || user.removedAt !== null) {
      throw new ForbiddenError("Only active users can perform authenticated actions.");
    }
  }
}
