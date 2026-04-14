import { createPrismaClient } from "@forum-reddit/database";
import { processPendingNotificationEvents } from "@forum-reddit/jobs";

import { env } from "./env";

async function runOnce() {
  const prisma = createPrismaClient(env.databaseUrl);

  try {
    await prisma.$connect();
    const result = await processPendingNotificationEvents(prisma, {
      processorId: "worker",
      processedFrom: "worker",
    });
    console.log(`Worker processed ${result.processedCount} notification event(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await runOnce();

  if (env.workerIntervalMs > 0) {
    setInterval(() => {
      void runOnce().catch((error) => {
        console.error("Worker iteration failed.", error);
      });
    }, env.workerIntervalMs);
  }
}

main().catch((error) => {
  console.error("Worker failed to start.", error);
  process.exit(1);
});
