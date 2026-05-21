const express = require("express");
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const { requireRole, requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

// GET /school
router.get("/", requireLevel(10), async (req, res) => {
  const { data, error } = await supabase.from("schools").select("*").eq("id", req.schoolId).single();
  if (error) return res.status(404).json({ error: "School not found" });
  res.json(data);
});

// PUT /school
router.put("/", requireRole("SUPERADMIN", "PRINCIPAL"), async (req, res) => {
  const keys = ["name","city","address","phone","email","logo_url","settings"];
  const patch = { updated_at: new Date().toISOString() };
  keys.forEach(k => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });
  const { data, error } = await supabase.from("schools").update(patch).eq("id", req.schoolId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /school/academic-years
router.get("/academic-years", requireLevel(30), async (req, res) => {
  const { data, error } = await supabase.from("academic_years").select("*, terms(*)").eq("school_id", req.schoolId).order("start_date", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST /school/academic-years
router.post("/academic-years", requireRole("SUPERADMIN", "PRINCIPAL"), async (req, res) => {
  const { name, startDate, endDate, isCurrent } = req.body;
  if (!name || !startDate || !endDate) return res.status(400).json({ error: "name, startDate, endDate required" });
  if (isCurrent) await supabase.from("academic_years").update({ is_current: false }).eq("school_id", req.schoolId);
  const { data, error } = await supabase.from("academic_years").insert({
    school_id: req.schoolId, name, start_date: startDate, end_date: endDate, is_current: !!isCurrent,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// GET /school/classes
router.get("/classes", requireLevel(30), async (req, res) => {
  const { data, error } = await supabase
    .from("classes")
    .select("*, students(id)")
    .eq("school_id", req.schoolId)
    .order("name");
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(c => ({ ...c, studentCount: c.students?.length || 0 })));
});

// POST /school/classes
router.post("/classes", requireRole("SUPERADMIN", "PRINCIPAL"), async (req, res) => {
  const { name, ageGroup, maxSize, color } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const { data, error } = await supabase.from("classes").insert({
    school_id: req.schoolId, name, age_group: ageGroup || null, max_size: maxSize || 15, color: color || null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /school/classes/:id
router.delete("/classes/:id", requireRole("SUPERADMIN", "PRINCIPAL"), async (req, res) => {
  const { data: existing } = await supabase.from("classes").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!existing?.length) return res.status(404).json({ error: "Class not found" });
  await supabase.from("classes").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

// GET /school/stats
router.get("/stats", requireLevel(30), async (req, res) => {
  const [students, leads, users, classes] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }).eq("school_id", req.schoolId).eq("status", "ACTIVE"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("school_id", req.schoolId),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("school_id", req.schoolId).eq("active", true),
    supabase.from("classes").select("id", { count: "exact", head: true }).eq("school_id", req.schoolId),
  ]);
  res.json({ students: students.count || 0, leads: leads.count || 0, users: users.count || 0, classes: classes.count || 0 });
});

module.exports = router;
