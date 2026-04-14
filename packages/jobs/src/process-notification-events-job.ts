import type { PrismaClient } from "@prisma/client";

import { NotificationEventsRepository } from "@forum-reddit/core";
import { resolveFollowerRecipientsByActorIds } from "@forum-reddit/infra";

type ProcessPendingNotificationEventsOptions = {
  limit?: number;
  processedFrom: string;
  processorId: string;
  claimTtlMs?: number;
};

export async function processPendingNotificationEvents(
  prisma: PrismaClient,
  {
    limit = 50,
    processedFrom,
    processorId,
    claimTtlMs = 60_000,
  }: ProcessPendingNotificationEventsOptions,
) {
  const notificationEventsRepository = new NotificationEventsRepository(prisma);
  const events = await notificationEventsRepository.claimPendingEvents({
    claimedBy: processorId,
    limit,
    claimStaleBefore: new Date(Date.now() - claimTtlMs),
  });

  const actorIds = [...new Set(events.map((event) => event.actorId))];
  const recipientsByActorId = await resolveFollowerRecipientsByActorIds(prisma, actorIds);

  for (const event of events) {
    const recipientIds = recipientsByActorId.get(event.actorId) ?? [];

    await notificationEventsRepository.markProcessed(event.id, processorId, {
      recipientIds,
      recipientCount: recipientIds.length,
      processedFrom,
    });
  }

  return {
    processedCount: events.length,
  };
}
