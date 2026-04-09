import type { PrismaClient } from "@prisma/client";
import express from "express";

import { prisma } from "./lib/prisma";
import { errorHandler } from "./middlewares/error-handler";
import { notFoundHandler } from "./middlewares/not-found";
import { resolveCurrentUser } from "./middlewares/resolve-current-user";
import { createRouter } from "./routes";

export function createApp(prismaClient: PrismaClient = prisma) {
  const app = express();

  app.use(express.json());
  app.use(resolveCurrentUser);
  app.use("/api", createRouter(prismaClient));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
