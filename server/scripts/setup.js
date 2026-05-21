/**
 * MMN Database Setup
 * Reads schema.sql, executes it against Supabase, then seeds default data.
 * Run: node scripts/setup.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const https  = require("https");
const fs     = require("fs");
const path   = require("path");
const bcrypt = require("bcrypt");

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF     = "zewokrqugycflirqoubd";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing from .env");
  process.exit(1);
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
function request(method, urlStr, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...extraHeaders,
        ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const rest = (method, table, body, extra) =>
  request(method, `${SUPABASE_URL}/rest/v1/${table}`, body, extra);

// ── Execute SQL via Supabase Management API ───────────────────────────────────
async function execSQL(sql) {
  const res = await request(
    "POST",
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    { query: sql },
    { Authorization: `Bearer ${SERVICE_KEY}` }
  );
  return res;
}

// ── Check if tables exist ─────────────────────────────────────────────────────
async function tablesExist() {
  const r = await rest("GET", "schools?select=id&limit=1");
  return r.status === 200;
}

// ── Seed helpers ──────────────────────────────────────────────────────────────
async function upsertSchool() {
  const r = await rest("POST", "schools",
    { name: "Mini Muslims Nest", slug: "mini-muslims-nest", city: "Lahore", phone: "+92 306 5058989" },
    { Prefer: "resolution=merge-duplicates,return=representation", "on_conflict": "slug" }
  );
  if (r.status === 200 || r.status === 201) {
    const row = Array.isArray(r.body) ? r.body[0] : r.body;
    return row;
  }
  // Try select if already exists
  const sel = await rest("GET", `schools?slug=eq.mini-muslims-nest&select=*`);
  return Array.isArray(sel.body) ? sel.body[0] : null;
}

async function upsertAdminUser(schoolId) {
  const passwordHash = await bcrypt.hash("mmnadmin2024", 12);
  const r = await rest("POST", "users",
    { school_id: schoolId, name: "Site Owner", email: "admin@mmn.com", password_hash: passwordHash, role: "SUPERADMIN", avatar: "👑", active: true },
    { Prefer: "resolution=merge-duplicates,return=representation", "on_conflict": "school_id,email" }
  );
  const row = Array.isArray(r.body) ? r.body[0] : r.body;
  return row;
}

async function upsertClass(schoolId, id, name, ageGroup, color) {
  await rest("POST", "classes",
    { id, school_id: schoolId, name, age_group: ageGroup, max_size: 12, color },
    { Prefer: "resolution=merge-duplicates,return=representation", "on_conflict": "id" }
  );
}

async function upsertAcademicYear(schoolId) {
  const yr = new Date().getFullYear();
  const id = `ay-${yr}-${yr+1}`;
  await rest("POST", "academic_years",
    { id, school_id: schoolId, name: `${yr}–${yr+1}`, start_date: `${yr}-08-01`, end_date: `${yr+1}-06-30`, is_current: true },
    { Prefer: "resolution=merge-duplicates,return=representation", "on_conflict": "id" }
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n  MMN Database Setup\n  " + "═".repeat(44));

  // ── Step 1: Check if tables already exist ─────────────────────────────────
  console.log("\n  1. Checking existing tables…");
  const exist = await tablesExist();

  if (!exist) {
    console.log("  ✗ Tables not found — attempting schema creation…");

    const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    const result = await execSQL(sql);

    if (result.status === 200 || result.status === 201) {
      console.log("  ✓ Schema created via Management API");
    } else {
      console.log("\n  ⚠  Could not auto-create tables (status:", result.status + ")");
      console.log("  ─────────────────────────────────────────────────────────────");
      console.log("  ACTION REQUIRED — paste the SQL below into Supabase SQL Editor:");
      console.log(`  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`);
      console.log("  ─────────────────────────────────────────────────────────────");
      console.log("  The SQL file is at: server/scripts/schema.sql");
      console.log("  Copy its contents → paste → click RUN → come back and run this script again.");
      console.log("");
      process.exit(0);
    }

    // Verify tables now exist
    const verified = await tablesExist();
    if (!verified) {
      console.log("  ✗ Schema creation failed. Please run schema.sql manually in the SQL Editor.");
      process.exit(1);
    }
  } else {
    console.log("  ✓ Tables already exist");
  }

  // ── Step 2: Seed default data ─────────────────────────────────────────────
  console.log("\n  2. Seeding default data…");

  const school = await upsertSchool();
  if (!school?.id) {
    console.error("  ✗ Failed to create/find school:", school);
    process.exit(1);
  }
  console.log(`  ✓ School: ${school.name} (${school.id})`);

  const adminUser = await upsertAdminUser(school.id);
  console.log("  ✓ Admin user: admin@mmn.com");

  await upsertClass(school.id, "cls-butterflies", "Butterflies", "4–5", "#F0876A");
  await upsertClass(school.id, "cls-sunflowers",  "Sunflowers",  "5–6", "#4BAE95");
  await upsertClass(school.id, "cls-stars",       "Stars",       "6–7", "#1B3F8B");
  console.log("  ✓ Classes: Butterflies, Sunflowers, Stars");

  await upsertAcademicYear(school.id);
  console.log("  ✓ Academic year created");

  // ── Step 3: Write SCHOOL_ID to .env ──────────────────────────────────────
  const envPath = path.join(__dirname, "../.env");
  let envText = fs.readFileSync(envPath, "utf8");
  envText = envText.replace(/^SCHOOL_ID=.*/m, `SCHOOL_ID="${school.id}"`);
  fs.writeFileSync(envPath, envText);
  console.log(`  ✓ SCHOOL_ID="${school.id}" saved to .env`);

  console.log("\n  ✅  Setup complete!\n");
  console.log("  Login:    admin@mmn.com / mmnadmin2024");
  console.log("  Start:    npm run api");
  console.log("  Project:  " + SUPABASE_URL);
  console.log("");
})();
