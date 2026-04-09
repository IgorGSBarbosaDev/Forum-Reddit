import type { PrismaClient } from "@prisma/client";

import { CurrentUserGuard } from "../users/current-user-guard";
import { NotificationEventsRepository } from "./repository";

export class NotificationsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationEventsRepository: NotificationEventsRepository,
    private readonly currentUserGuard: CurrentUserGuard,
  ) {}

  async processPendingEvents(currentUserId: string, limit = 50) {
    await this.currentUserGuard.assertActiveUser(currentUserId);

    const events = await this.notificationEventsRepository.findPendingEvents(limit);
    let processedCount = 0;

    for (const event of events) {
      const followers = await this.prisma.follow.findMany({
        where: {
          followingId: event.actorId,
          follower: {
            OR: [
              {
                notificationSettings: {
                  is: null,
                },
              },
              {
                notificationSettings: {
                  is: {
                    notifyOnFollowedPosts: true,
                  },
                },
              },
            ],
          },
        },
        select: {
          followerId: true,
        },
      });

      await this.notificationEventsRepository.markProcessed(event.id, {
        recipientIds: followers.map((entry) => entry.followerId),
        recipientCount: followers.length,
        processedFrom: "manual-worker",
      });

      processedCount += 1;
    }

    return {
      processedCount,
    };
  }
}
