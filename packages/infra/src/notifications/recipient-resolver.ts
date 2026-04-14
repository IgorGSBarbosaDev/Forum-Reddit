import type { PrismaClient } from "@prisma/client";

export async function resolveFollowerRecipientsByActorIds(
  prisma: PrismaClient,
  actorIds: readonly string[],
) {
  if (actorIds.length === 0) {
    return new Map<string, string[]>();
  }

  const follows = await prisma.follow.findMany({
    where: {
      followingId: {
        in: [...actorIds],
      },
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
      followingId: true,
    },
  });

  const recipientsByActorId = new Map<string, string[]>();

  for (const actorId of actorIds) {
    recipientsByActorId.set(actorId, []);
  }

  for (const follow of follows) {
    recipientsByActorId.get(follow.followingId)?.push(follow.followerId);
  }

  return recipientsByActorId;
}
