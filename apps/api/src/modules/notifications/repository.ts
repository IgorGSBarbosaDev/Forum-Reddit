import { NotificationEventType, type Prisma, type PrismaClient } from "@prisma/client";

type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

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

  async findPendingEvents(limit = 50) {
    return this.prisma.notificationEvent.findMany({
      where: {
        processedAt: null,
      },
      orderBy: [
        {
          createdAt: "asc",
        },
        {
          id: "asc",
        },
      ],
      take: limit,
      select: {
        id: true,
        actorId: true,
        postId: true,
        type: true,
        payload: true,
        createdAt: true,
      },
    });
  }

  async markProcessed(eventId: string, payload: Prisma.InputJsonValue) {
    return this.prisma.notificationEvent.update({
      where: {
        id: eventId,
      },
      data: {
        processedAt: new Date(),
        payload,
      },
    });
  }
}
