require("dotenv").config();

const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  const password = await bcrypt.hash("Password@123", 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },
    update: {},
    create: {
      name: "System Administrator Account",
      email: "admin@example.com",
      password,
      address: "Nagpur, Maharashtra",
      role: "ADMIN",
    },
  });

  // Store Owner
  const owner = await prisma.user.upsert({
    where: {
      email: "owner@example.com",
    },
    update: {},
    create: {
      name: "Store Owner Account Example",
      email: "owner@example.com",
      password,
      address: "Mumbai, Maharashtra",
      role: "STORE_OWNER",
    },
  });

  // Normal User
  const user = await prisma.user.upsert({
    where: {
      email: "user@example.com",
    },
    update: {},
    create: {
      name: "Normal User Account Example",
      email: "user@example.com",
      password,
      address: "Pune, Maharashtra",
      role: "USER",
    },
  });

  // Store
  const store = await prisma.store.create({
    data: {
      name: "Tech World Electronics Store",
      email: "store@example.com",
      address: "MG Road, Pune, Maharashtra",
      ownerId: owner.id,
    },
  });

  console.log("Seed completed");
  console.log("Admin:", admin.email);
  console.log("Owner:", owner.email);
  console.log("User:", user.email);
  console.log("Store ID:", store.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());