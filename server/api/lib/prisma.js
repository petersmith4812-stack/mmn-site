require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const { PrismaClient } = require("@prisma/client");

// Singleton — re-use across hot reloads in dev
const globalForPrisma = globalThis;
const prisma = globalForPrisma.__prisma ?? new PrismaClient({ log: ["error"] });
if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;

module.exports = prisma;
