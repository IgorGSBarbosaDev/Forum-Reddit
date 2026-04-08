import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function bootstrap() {
  await prisma.$connect();

  app.listen(env.port, () => {
    console.log(`HTTP server running on port ${env.port}`);
  });
}

bootstrap().catch(async (error) => {
  console.error("Failed to start server.", error);
  await prisma.$disconnect();
  process.exit(1);
});
