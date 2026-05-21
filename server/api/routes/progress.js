const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

const VALID_DOMAINS = [
  "Language & Literacy","Mathematics","Physical Development",
  "Social-Emotional","Creative Arts","Islamic Studies","Arabic","Understanding of the World",
];
const VALID_LEVELS = ["EMERGING","DEVELOPING","SECURE","MASTERED"];

// GET /progress?studentId=&domain=
router.get("/", async (req, res) => {
  const { studentId, domain } = req.query;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const { data: stu } = await supabase.from("students").select("id").eq("id", studentId).eq("school_id", req.schoolId).limit(1);
  if (!stu?.length) return res.status(404).json({ error: "Student not found" });

  let q = supabase.from("progress_records").select("*").eq("student_id", studentId).order("observed_at", { ascending: false });
  if (domain) q = q.eq("domain", domain);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// POST /progress
router.post("/", requireLevel(50), async (req, res) => {
  const { studentId, domain, objective, level, notes, evidenceUrl, observedAt } = req.body;
  if (!studentId || !domain || !objective || !level) return res.status(400).json({ error: "studentId, domain, objective, level required" });
  if (!VALID_LEVELS.includes(level)) return res.status(400).json({ error: `level must be one of: ${VALID_LEVELS.join(", ")}` });

  const { data: stu } = await supabase.from("students").select("id").eq("id", studentId).eq("school_id", req.schoolId).limit(1);
  if (!stu?.length) return res.status(404).json({ error: "Student not found" });

  const { data, error } = await supabase.from("progress_records").insert({
    student_id:   studentId,
    domain,
    objective,
    level,
    notes:        notes       || null,
    evidence_url: evidenceUrl || null,
    observed_at:  observedAt  || new Date().toISOString(),
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// PUT /progress/:id
router.put("/:id", requireLevel(50), async (req, res) => {
  const { domain, objective, level, notes, evidenceUrl, observedAt } = req.body;
  if (level && !VALID_LEVELS.includes(level)) return res.status(400).json({ error: `level must be one of: ${VALID_LEVELS.join(", ")}` });
  const patch = {};
  if (domain      !== undefined) patch.domain       = domain;
  if (objective   !== undefined) patch.objective    = objective;
  if (level       !== undefined) patch.level        = level;
  if (notes       !== undefined) patch.notes        = notes || null;
  if (evidenceUrl !== undefined) patch.evidence_url = evidenceUrl || null;
  if (observedAt  !== undefined) patch.observed_at  = observedAt;

  const { data, error } = await supabase.from("progress_records").update(patch).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /progress/:id
router.delete("/:id", requireLevel(60), async (req, res) => {
  const { error } = await supabase.from("progress_records").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
