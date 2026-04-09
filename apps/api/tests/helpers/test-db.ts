import "dotenv/config";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Client } from "pg";

import { createApp } from "../../src/app";

const TEST_DATABASE_NAME = "forum_reddit_test";

function getBaseDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run API integration tests.");
  }

  return databaseUrl;
}

function buildTestDatabaseUrl() {
  const url = new URL(getBaseDatabaseUrl());
  url.pathname = `/${TEST_DATABASE_NAME}`;
  return url;
}

function buildAdminDatabaseUrl() {
  const url = buildTestDatabaseUrl();
  url.pathname = "/postgres";
  return url;
}

function quoteIdentifier(identifier: string) {
  if (!/^[A-Za-z0-9_]+$/.test(identifier)) {
    throw new Error(`Unsafe identifier: ${identifier}`);
  }

  return `"${identifier}"`;
}

async function readMigrationSql() {
  const migrationsDir = path.resolve(process.cwd(), "prisma/migrations");
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const migrationDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (migrationDirs.length === 0) {
    throw new Error("No Prisma migrations were found for API integration tests.");
  }

  const sqlChunks = await Promise.all(
    migrationDirs.map((migrationDir) =>
      readFile(path.join(migrationsDir, migrationDir, "migration.sql"), "utf8"),
    ),
  );

  return sqlChunks.join("\n");
}

export async function ensureTestDatabase() {
  const adminClient = new Client({
    connectionString: buildAdminDatabaseUrl().toString(),
  });

  await adminClient.connect();

  try {
    const existing = await adminClient.query<{ datname: string }>(
      "SELECT datname FROM pg_database WHERE datname = $1",
      [TEST_DATABASE_NAME],
    );

    if (existing.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${quoteIdentifier(TEST_DATABASE_NAME)}`);
    }
  } finally {
    await adminClient.end();
  }
}

export async function resetTestDatabase() {
  const client = new Client({
    connectionString: buildTestDatabaseUrl().toString(),
  });

  await client.connect();

  try {
    const migrationSql = await readMigrationSql();

    await client.query(`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    await client.query(migrationSql);
  } finally {
    await client.end();
  }
}

export function createTestPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: buildTestDatabaseUrl().toString(),
  });

  return new PrismaClient({
    adapter,
  });
}

export async function createApiTestContext() {
  const prisma = createTestPrismaClient();
  await prisma.$connect();

  return {
    app: createApp(prisma),
    prisma,
  };
}
