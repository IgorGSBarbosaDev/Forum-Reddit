import test from "node:test";
import assert from "node:assert/strict";

import { resolveFollowerRecipientsByActorIds } from "@forum-reddit/infra";

test("resolveFollowerRecipientsByActorIds groups recipients by followed actor", async () => {
  const findManyCalls: unknown[] = [];
  const prisma = {
    follow: {
      findMany: async (input: unknown) => {
        findManyCalls.push(input);
        return [
          { followerId: "follower-1", followingId: "actor-1" },
          { followerId: "follower-2", followingId: "actor-1" },
          { followerId: "follower-3", followingId: "actor-2" },
        ];
      },
    },
  };

  const recipients = await resolveFollowerRecipientsByActorIds(prisma as never, ["actor-1", "actor-2"]);

  assert.deepEqual(recipients.get("actor-1"), ["follower-1", "follower-2"]);
  assert.deepEqual(recipients.get("actor-2"), ["follower-3"]);
  assert.equal(findManyCalls.length, 1);
});

test("resolveFollowerRecipientsByActorIds skips the database when no actor ids are provided", async () => {
  const prisma = {
    follow: {
      findMany: async () => {
        throw new Error("findMany should not be called");
      },
    },
  };

  const recipients = await resolveFollowerRecipientsByActorIds(prisma as never, []);

  assert.equal(recipients.size, 0);
});
