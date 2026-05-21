const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

const VALID_MEALS    = ["BREAKFAST","MORNING_SNACK","LUNCH","AFTERNOON_SNACK"];
const VALID_PORTIONS = ["ALL","MOST","HALF","LITTLE","NONE"];

// GET /nutrition?studentId=&date=&from=&to=
router.get("/", async (req, res) => {
  const { studentId, date, from, to, classId } = req.query;

  let stuQ = supabase.from("students").select("id").eq("school_id", req.schoolId);
  if (studentId) stuQ = stuQ.eq("id", studentId);
  if (classId)   stuQ = stuQ.eq("class_id", classId);
  const { data: stuRows } = await stuQ;
  if (!stuRows?.length) return res.json({ data: [] });
  const sids = stuRows.map(s => s.id);

  let q = supabase.from("nutrition_logs")
    .select("*, students(id,first_name,last_name)")
    .in("student_id", sids)
    .order("date", { ascending: false })
    .order("meal", { ascending: true });

  if (date) q = q.eq("date", date);
  if (from) q = q.gte("date", from);
  if (to)   q = q.lte("date", to);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// POST /nutrition
router.post("/", requireLevel(50), async (req, res) => {
  const { studentId, date, meal, items, portionEaten, notes } = req.body;
  if (!studentId || !date || !meal) return res.status(400).json({ error: "studentId, date, meal required" });
  if (!VALID_MEALS.includes(meal)) return res.status(400).json({ error: `meal must be one of: ${VALID_MEALS.join(", ")}` });
  if (portionEaten && !VALID_PORTIONS.includes(portionEaten)) return res.status(400).json({ error: `portionEaten must be one of: ${VALID_PORTIONS.join(", ")}` });

  const { data: stu } = await supabase.from("students").select("id").eq("id", studentId).eq("school_id", req.schoolId).limit(1);
  if (!stu?.length) return res.status(404).json({ error: "Student not found" });

  // Upsert on student_id + date + meal
  const { data, error } = await supabase.from("nutrition_logs").upsert({
    student_id:    studentId,
    date,
    meal,
    items:         Array.isArray(items) ? items : [],
    portion_eaten: portionEaten || null,
    notes:         notes || null,
  }, { onConflict: "student_id,date,meal" }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// PUT /nutrition/:id
router.put("/:id", requireLevel(50), async (req, res) => {
  const { items, portionEaten, notes, meal, date } = req.body;
  const patch = {};
  if (items        !== undefined) patch.items         = Array.isArray(items) ? items : [];
  if (portionEaten !== undefined) patch.portion_eaten  = portionEaten || null;
  if (notes        !== undefined) patch.notes          = notes || null;
  if (meal         !== undefined) patch.meal           = meal;
  if (date         !== undefined) patch.date           = date;

  const { data, error } = await supabase.from("nutrition_logs").update(patch).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /nutrition/:id
router.delete("/:id", requireLevel(60), async (req, res) => {
  const { error } = await supabase.from("nutrition_logs").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
