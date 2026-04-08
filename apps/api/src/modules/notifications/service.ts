import type { PrismaClient } from "@prisma/client";

import { NotificationEventsRepository } from "./repository";

export class NotificationsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly notificationEventsRepository: NotificationEventsRepository,
  ) {}

  async processPendingEvents(limit = 50) {
    const events = await this.notificationEventsRepository.findPendingEvents(limit);
    let processedCount = 0;

    for (const event of events) {
      const followers = await this.prisma.follow.findMany({
        where: {
          followingId: event.actorId,
          follower: {
            notificationSettings: {
              notifyOnFollowedPosts: true,
            },
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
