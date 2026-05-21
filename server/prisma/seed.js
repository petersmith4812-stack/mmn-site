require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  console.log("\n  MMN Database Seed\n  " + "─".repeat(40));

  // ── School ────────────────────────────────────────────────
  const school = await prisma.school.upsert({
    where: { slug: "mini-muslims-nest" },
    update: {},
    create: {
      name: "Mini Muslims Nest",
      slug: "mini-muslims-nest",
      timezone: "Asia/Karachi",
      country: "PK",
      city: "Lahore",
      phone: "+92 306 5058989",
    },
  });
  console.log("  ✓ School:", school.name, `(${school.id})`);

  // ── Write SCHOOL_ID to .env ───────────────────────────────
  const envPath = path.join(__dirname, "../.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(/^SCHOOL_ID=.*/m, `SCHOOL_ID="${school.id}"`);
  fs.writeFileSync(envPath, envContent);
  console.log("  ✓ SCHOOL_ID written to .env");

  // ── Default admin user ────────────────────────────────────
  const passwordHash = await bcrypt.hash("mmnadmin2024", 12);
  const admin = await prisma.user.upsert({
    where: { schoolId_email: { schoolId: school.id, email: "admin@mmn.com" } },
    update: {},
    create: {
      schoolId: school.id,
      name: "Site Owner",
      email: "admin@mmn.com",
      passwordHash,
      role: "SUPERADMIN",
      avatar: "👑",
      active: true,
    },
  });
  console.log("  ✓ Admin user:", admin.email);

  // ── Academic year ─────────────────────────────────────────
  const yr = new Date().getFullYear();
  const academicYear = await prisma.academicYear.upsert({
    where: { id: "acy-2025-2026" },
    update: {},
    create: {
      id: "acy-2025-2026",
      schoolId: school.id,
      name: `${yr}–${yr + 1}`,
      startDate: new Date(`${yr}-08-01`),
      endDate: new Date(`${yr + 1}-06-30`),
      isCurrent: true,
    },
  });
  console.log("  ✓ Academic year:", academicYear.name);

  // ── Default classes ───────────────────────────────────────
  const classes = [
    { id: "class-butterflies", name: "Butterflies", ageGroup: "4–5", maxSize: 12, color: "#F0876A" },
    { id: "class-sunflowers",  name: "Sunflowers",  ageGroup: "5–6", maxSize: 12, color: "#4BAE95" },
    { id: "class-stars",       name: "Stars",       ageGroup: "6–7", maxSize: 12, color: "#1B3F8B" },
  ];
  for (const cls of classes) {
    await prisma.class.upsert({
      where: { id: cls.id },
      update: {},
      create: { ...cls, schoolId: school.id },
    });
  }
  console.log("  ✓ Classes: Butterflies, Sunflowers, Stars");

  console.log("\n  Seed complete!\n");
  console.log("  Login: admin@mmn.com / mmnadmin2024");
  console.log("  School ID:", school.id);
  console.log("");
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
