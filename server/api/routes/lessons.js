const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

// GET /lessons?classId=&date=&from=&to=&subject=&status=
router.get("/", async (req, res) => {
  const { classId, date, from, to, subject, status } = req.query;
  let q = supabase.from("lesson_plans")
    .select("*, classes(id,name,color)")
    .eq("school_id", req.schoolId)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (classId) q = q.eq("class_id", classId);
  if (date)    q = q.eq("date", date);
  if (from)    q = q.gte("date", from);
  if (to)      q = q.lte("date", to);
  if (subject) q = q.eq("subject", subject);
  if (status)  q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /lessons/:id
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("lesson_plans")
    .select("*, classes(id,name,color)")
    .eq("id", req.params.id)
    .eq("school_id", req.schoolId)
    .single();
  if (error) return res.status(404).json({ error: "Lesson plan not found" });
  res.json({ data });
});

// POST /lessons
router.post("/", requireLevel(50), async (req, res) => {
  const { classId, academicYearId, date, subject, title, objectives, activities, resources, assessment, status } = req.body;
  if (!date || !subject || !title) return res.status(400).json({ error: "date, subject, title required" });

  const { data, error } = await supabase.from("lesson_plans").insert({
    school_id:        req.schoolId,
    class_id:         classId        || null,
    academic_year_id: academicYearId || null,
    date,
    subject,
    title,
    objectives:  Array.isArray(objectives) ? objectives : [],
    activities:  activities  || null,
    resources:   resources   || null,
    assessment:  assessment  || null,
    status:      status      || "DRAFT",
    created_by:  req.user.userId,
  }).select("*, classes(id,name,color)").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// PUT /lessons/:id
router.put("/:id", requireLevel(50), async (req, res) => {
  const allowed = ["class_id","date","subject","title","objectives","activities","resources","assessment","status"];
  const keyMap  = { classId:"class_id", academicYearId:"academic_year_id" };
  const patch   = { updated_at: new Date().toISOString() };

  for (const [k, v] of Object.entries(req.body)) {
    const col = keyMap[k] || (allowed.includes(k) ? k : null);
    if (col) patch[col] = v;
  }

  const { data, error } = await supabase.from("lesson_plans")
    .update(patch)
    .eq("id", req.params.id)
    .eq("school_id", req.schoolId)
    .select("*, classes(id,name,color)")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /lessons/:id
router.delete("/:id", requireLevel(60), async (req, res) => {
  const { error } = await supabase.from("lesson_plans").delete().eq("id", req.params.id).eq("school_id", req.schoolId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
