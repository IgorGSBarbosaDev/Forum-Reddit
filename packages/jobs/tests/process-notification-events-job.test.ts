import test from "node:test";
import assert from "node:assert/strict";

import { processPendingNotificationEvents } from "@forum-reddit/jobs";

const now = new Date("2026-04-08T10:00:00.000Z");

test("processPendingNotificationEvents claims events and marks them with grouped recipients", async () => {
  const markedEvents: Array<{
    where: unknown;
    data: {
      processedAt: Date;
      payload: unknown;
    };
  }> = [];
  const prisma = {
    $queryRaw: async () => [
      { id: "event-1", actorId: "actor-1", postId: "post-1", type: "POST_PUBLISHED", payload: null, createdAt: now },
      { id: "event-2", actorId: "actor-2", postId: "post-2", type: "POST_PUBLISHED", payload: null, createdAt: now },
    ],
    follow: {
      findMany: async () => [
        { followerId: "follower-1", followingId: "actor-1" },
        { followerId: "follower-2", followingId: "actor-1" },
        { followerId: "follower-3", followingId: "actor-2" },
      ],
    },
    notificationEvent: {
      updateMany: async (input: { where: unknown; data: { processedAt: Date; payload: unknown } }) => {
        markedEvents.push(input);
      },
    },
  };

  const result = await processPendingNotificationEvents(prisma as never, {
    limit: 2,
    processedFrom: "unit-test",
    processorId: "worker-1",
    claimTtlMs: 30_000,
  });

  assert.deepEqual(result, { processedCount: 2 });
  assert.deepEqual(markedEvents, [
    {
      where: { id: "event-1", processedAt: null, claimedBy: "worker-1" },
      data: {
        claimedAt: null,
        claimedBy: null,
        processedAt: markedEvents[0].data.processedAt,
        payload: {
          recipientIds: ["follower-1", "follower-2"],
          recipientCount: 2,
          processedFrom: "unit-test",
        },
      },
    },
    {
      where: { id: "event-2", processedAt: null, claimedBy: "worker-1" },
      data: {
        claimedAt: null,
        claimedBy: null,
        processedAt: markedEvents[1].data.processedAt,
        payload: {
          recipientIds: ["follower-3"],
          recipientCount: 1,
          processedFrom: "unit-test",
        },
      },
    },
  ]);
  assert.equal(markedEvents[0].data.processedAt instanceof Date, true);
  assert.equal(markedEvents[1].data.processedAt instanceof Date, true);
});
