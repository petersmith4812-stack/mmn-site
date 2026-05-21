const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

const VALID_CATS     = ["POSITIVE","CHALLENGING","NEUTRAL"];
const VALID_SETTINGS = ["CLASSROOM","PLAYGROUND","LUNCH","NAP_TIME","TRANSITION","OTHER"];

async function getSchoolStudentIds(schoolId, studentId) {
  let q = supabase.from("students").select("id").eq("school_id", schoolId);
  if (studentId) q = q.eq("id", studentId);
  const { data } = await q;
  return (data || []).map(s => s.id);
}

// GET /behaviour?studentId=&from=&to=&category=
router.get("/", async (req, res) => {
  const { studentId, from, to, category } = req.query;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const sids = await getSchoolStudentIds(req.schoolId, studentId);
  if (!sids.length) return res.status(404).json({ error: "Student not found" });

  let q = supabase.from("behaviour_logs").select("*")
    .in("student_id", sids)
    .order("observed_at", { ascending: false });

  if (category) q = q.eq("category", category);
  if (from)     q = q.gte("observed_at", from);
  if (to)       q = q.lte("observed_at", to + "T23:59:59Z");

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /behaviour/stats?studentId=&from=&to=
router.get("/stats", async (req, res) => {
  const { studentId, from, to } = req.query;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const sids = await getSchoolStudentIds(req.schoolId, studentId);
  if (!sids.length) return res.status(404).json({ error: "Student not found" });

  let q = supabase.from("behaviour_logs").select("category,intensity").in("student_id", sids);
  if (from) q = q.gte("observed_at", from);
  if (to)   q = q.lte("observed_at", to + "T23:59:59Z");

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const rows = data || [];
  const total = rows.length;
  const byCategory = { POSITIVE: 0, CHALLENGING: 0, NEUTRAL: 0 };
  let intensitySum = 0, intensityCount = 0;
  rows.forEach(r => {
    if (byCategory[r.category] !== undefined) byCategory[r.category]++;
    if (r.intensity) { intensitySum += r.intensity; intensityCount++; }
  });
  const avgIntensity = intensityCount ? Math.round(intensitySum / intensityCount * 10) / 10 : null;
  res.json({ total, ...byCategory, avgIntensity });
});

// POST /behaviour
router.post("/", requireLevel(50), async (req, res) => {
  const { studentId, category, setting, antecedent, behaviour, consequence, intensity, duration, notes, observedAt } = req.body;
  if (!studentId || !behaviour) return res.status(400).json({ error: "studentId and behaviour required" });
  if (category  && !VALID_CATS.includes(category))     return res.status(400).json({ error: "Invalid category" });
  if (setting   && !VALID_SETTINGS.includes(setting))  return res.status(400).json({ error: "Invalid setting" });
  if (intensity && (intensity < 1 || intensity > 5))   return res.status(400).json({ error: "intensity must be 1–5" });

  const sids = await getSchoolStudentIds(req.schoolId, studentId);
  if (!sids.length) return res.status(404).json({ error: "Student not found" });

  const { data, error } = await supabase.from("behaviour_logs").insert({
    student_id:  studentId,
    category:    category   || "NEUTRAL",
    setting:     setting    || "CLASSROOM",
    antecedent:  antecedent || null,
    behaviour,
    consequence: consequence || null,
    intensity:   intensity   || null,
    duration:    duration    || null,
    notes:       notes       || null,
    observed_at: observedAt  || new Date().toISOString(),
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// PUT /behaviour/:id
router.put("/:id", requireLevel(50), async (req, res) => {
  const fields = ["category","setting","antecedent","behaviour","consequence","intensity","duration","notes","observed_at"];
  const keyMap = { observedAt:"observed_at" };
  const patch  = {};
  for (const [k, v] of Object.entries(req.body)) {
    const col = keyMap[k] || (fields.includes(k) ? k : null);
    if (col) patch[col] = v;
  }
  const { data, error } = await supabase.from("behaviour_logs").update(patch).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /behaviour/:id
router.delete("/:id", requireLevel(60), async (req, res) => {
  const { error } = await supabase.from("behaviour_logs").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
