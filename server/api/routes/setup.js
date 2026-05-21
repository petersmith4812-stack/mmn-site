const express  = require("express");
const bcrypt   = require("bcrypt");
const fs       = require("fs");
const path     = require("path");
const supabase  = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const { requireRole, injectSchool } = require("../middleware/rbac");

const router = express.Router();

// GET /setup/status — check if tables exist (public, called from DashCloud)
router.get("/status", async (_req, res) => {
  const { data, error } = await supabase.from("schools").select("id").limit(1);
  if (error) return res.json({ tablesExist: false, seeded: false, error: error.message });
  const { data: school } = await supabase.from("schools").select("id,name").eq("slug","mini-muslims-nest").limit(1);
  res.json({ tablesExist: true, seeded: !!(school?.length), schoolId: school?.[0]?.id });
});

// POST /setup/seed — seed default school, admin, classes (requires superadmin or no users exist yet)
router.post("/seed", async (req, res) => {
  // Allow if no users exist yet (first-run bootstrap), or if superadmin
  const { data: anyUser } = await supabase.from("users").select("id").limit(1);
  const isFirstRun = !anyUser?.length;

  if (!isFirstRun) {
    // Verify auth
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "Auth required after first run" });
    const jwt = require("jsonwebtoken");
    try {
      const payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET || "mmn-jwt-secret-please-change");
      if (payload.role !== "SUPERADMIN") return res.status(403).json({ error: "Superadmin only" });
    } catch { return res.status(401).json({ error: "Invalid token" }); }
  }

  // Upsert school
  let { data: schools } = await supabase.from("schools").select("*").eq("slug","mini-muslims-nest").limit(1);
  let school = schools?.[0];
  if (!school) {
    const { data: created, error } = await supabase.from("schools")
      .insert({ name:"Mini Muslims Nest", slug:"mini-muslims-nest", city:"Lahore", phone:"+92 306 5058989" })
      .select().single();
    if (error) return res.status(500).json({ error: "Failed to create school: " + error.message });
    school = created;
  }

  // Upsert admin user
  const { data: existingUser } = await supabase.from("users").select("id").eq("school_id", school.id).eq("email","admin@mmn.com").limit(1);
  if (!existingUser?.length) {
    const password_hash = await bcrypt.hash("mmnadmin2024", 12);
    await supabase.from("users").insert({
      school_id: school.id, name:"Site Owner", email:"admin@mmn.com",
      password_hash, role:"SUPERADMIN", avatar:"👑", active: true,
    });
  }

  // Upsert classes
  const classes = [
    { id:"cls-butterflies", name:"Butterflies", age_group:"4–5", max_size:12, color:"#F0876A" },
    { id:"cls-sunflowers",  name:"Sunflowers",  age_group:"5–6", max_size:12, color:"#4BAE95" },
    { id:"cls-stars",       name:"Stars",       age_group:"6–7", max_size:12, color:"#1B3F8B" },
  ];
  for (const cls of classes) {
    const { data: ex } = await supabase.from("classes").select("id").eq("id",cls.id).limit(1);
    if (!ex?.length) await supabase.from("classes").insert({ ...cls, school_id: school.id });
  }

  // Upsert academic year
  const yr = new Date().getFullYear();
  const ayId = `ay-${yr}-${yr+1}`;
  const { data: existAy } = await supabase.from("academic_years").select("id").eq("id",ayId).limit(1);
  if (!existAy?.length) {
    await supabase.from("academic_years").insert({
      id: ayId, school_id: school.id, name:`${yr}–${yr+1}`,
      start_date:`${yr}-08-01`, end_date:`${yr+1}-06-30`, is_current: true,
    });
  }

  // Write SCHOOL_ID to .env
  const envPath = path.join(__dirname, "../../.env");
  try {
    let txt = fs.readFileSync(envPath, "utf8");
    if (/^SCHOOL_ID=/m.test(txt)) {
      txt = txt.replace(/^SCHOOL_ID=.*/m, `SCHOOL_ID="${school.id}"`);
    } else {
      txt = txt.trimEnd() + `\nSCHOOL_ID="${school.id}"\n`;
    }
    fs.writeFileSync(envPath, txt);
  } catch {}

  res.json({ ok: true, schoolId: school.id, message: "Database seeded. Login: admin@mmn.com / mmnadmin2024" });
});

module.exports = router;
