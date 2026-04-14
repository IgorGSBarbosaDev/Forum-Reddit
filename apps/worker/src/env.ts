import path from "node:path";

import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 0);

if (Number.isNaN(intervalMs) || intervalMs < 0) {
  throw new Error("WORKER_INTERVAL_MS must be zero or a positive number.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  workerIntervalMs: intervalMs,
};
