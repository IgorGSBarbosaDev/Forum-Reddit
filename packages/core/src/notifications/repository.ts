import { NotificationEventType, type Prisma, type PrismaClient } from "@prisma/client";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;
type ClaimedNotificationEvent = {
  id: string;
  actorId: string;
  postId: string | null;
  type: NotificationEventType;
  payload: Prisma.JsonValue | null;
  createdAt: Date;
};

type ClaimPendingEventsInput = {
  claimedBy: string;
  limit?: number;
  claimStaleBefore: Date;
};

export class NotificationEventsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPostPublishedEvent(actorId: string, postId: string, client: PrismaClientLike = this.prisma) {
    return client.notificationEvent.create({
      data: {
        type: NotificationEventType.POST_PUBLISHED,
        actorId,
        postId,
      },
    });
  }

  async claimPendingEvents({ claimedBy, limit = 50, claimStaleBefore }: ClaimPendingEventsInput) {
    const claimedEvents = await this.prisma.$queryRaw<ClaimedNotificationEvent[]>`
      WITH next_events AS (
        SELECT ne.id
        FROM "NotificationEvent" AS ne
        WHERE ne."processedAt" IS NULL
          AND (
            ne."claimedAt" IS NULL
            OR ne."claimedAt" < ${claimStaleBefore}
          )
        ORDER BY ne."createdAt" ASC, ne."id" ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE "NotificationEvent" AS target
      SET "claimedAt" = NOW(),
          "claimedBy" = ${claimedBy}
      FROM next_events
      WHERE target.id = next_events.id
      RETURNING target.id, target."actorId", target."postId", target.type, target.payload, target."createdAt"
    `;

    return claimedEvents;
  }

  async markProcessed(eventId: string, claimedBy: string, payload: Prisma.InputJsonValue) {
    return this.prisma.notificationEvent.updateMany({
      where: {
        id: eventId,
        processedAt: null,
        claimedBy,
      },
      data: {
        claimedAt: null,
        claimedBy: null,
        processedAt: new Date(),
        payload,
      },
    });
  }
}
