import { createPrismaClient } from "@forum-reddit/database";

import { env } from "../config/env";

export const prisma = createPrismaClient(env.databaseUrl);
