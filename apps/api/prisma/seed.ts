import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const developmentUsers = [
  {
    id: "admin",
    username: "admin",
    email: "admin@example.com",
    displayName: "Admin",
  },
  {
    id: "user-1",
    username: "user1",
    email: "user1@example.com",
    displayName: "User One",
  },
  {
    id: "user-2",
    username: "user2",
    email: "user2@example.com",
    displayName: "User Two",
  },
  {
    id: "moderator-1",
    username: "moderator1",
    email: "moderator1@example.com",
    displayName: "Moderator One",
  },
];

async function main() {
  for (const user of developmentUsers) {
    await prisma.user.upsert({
      where: {
        id: user.id,
      },
      update: {
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
      create: user,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
