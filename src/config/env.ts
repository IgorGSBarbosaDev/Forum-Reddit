import dotenv from "dotenv";

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT must be a positive number.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required.");
}

export const env = {
  port,
  databaseUrl: process.env.DATABASE_URL,
};
