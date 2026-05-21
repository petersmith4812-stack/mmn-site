const express       = require("express");
const supabase      = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

// GET /attendance?date=&classId=&studentId=&from=&to=
router.get("/", async (req, res) => {
  const { date, classId, studentId, from, to } = req.query;

  let stuQ = supabase.from("students").select("id").eq("school_id", req.schoolId);
  if (classId)   stuQ = stuQ.eq("class_id", classId);
  if (studentId) stuQ = stuQ.eq("id", studentId);
  const { data: stuRows } = await stuQ;
  if (!stuRows?.length) return res.json({ data: [] });

  const sids = stuRows.map(s => s.id);

  let q = supabase.from("attendance")
    .select("*, students(id,first_name,last_name,class_id,classes(id,name,color))")
    .in("student_id", sids)
    .order("date", { ascending: false });

  if (date)      q = q.eq("date", date);
  if (studentId) q = q.eq("student_id", studentId);
  if (from)      q = q.gte("date", from);
  if (to)        q = q.lte("date", to);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /attendance/stats?studentId=&from=&to=
router.get("/stats", async (req, res) => {
  const { studentId, from, to } = req.query;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const { data: stu } = await supabase.from("students").select("id").eq("id", studentId).eq("school_id", req.schoolId).limit(1);
  if (!stu?.length) return res.status(404).json({ error: "Student not found" });

  let q = supabase.from("attendance").select("status,date").eq("student_id", studentId);
  if (from) q = q.gte("date", from);
  if (to)   q = q.lte("date", to);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0, HALF_DAY: 0 };
  (data || []).forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
  const total = data?.length || 0;
  const effective = counts.PRESENT + counts.LATE * 0.5 + counts.HALF_DAY * 0.5;
  const attendanceRate = total ? Math.round(effective / total * 100) : 0;
  res.json({ total, ...counts, attendanceRate });
});

// POST /attendance/bulk — upsert array of { studentId, date, status, notes }
router.post("/bulk", requireLevel(50), async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records)) return res.status(400).json({ error: "records must be array" });

  const { data: stuRows } = await supabase.from("students").select("id").eq("school_id", req.schoolId);
  const valid = new Set((stuRows || []).map(s => s.id));

  const rows = records
    .filter(r => r.studentId && r.date && r.status && valid.has(r.studentId))
    .map(r => ({
      student_id:     r.studentId,
      date:           r.date,
      status:         r.status,
      notes:          r.notes          || null,
      arrival_time:   r.arrivalTime    || null,
      departure_time: r.departureTime  || null,
    }));

  if (!rows.length) return res.json({ ok: true, saved: 0, failed: records.length });

  const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,date" });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, saved: rows.length, failed: records.length - rows.length });
});

// POST /attendance — single upsert
router.post("/", requireLevel(50), async (req, res) => {
  const { studentId, date, status, notes, arrivalTime, departureTime } = req.body;
  if (!studentId || !date || !status) return res.status(400).json({ error: "studentId, date, status required" });

  const { data: stu } = await supabase.from("students").select("id").eq("id", studentId).eq("school_id", req.schoolId).limit(1);
  if (!stu?.length) return res.status(404).json({ error: "Student not found" });

  const { data, error } = await supabase.from("attendance")
    .upsert({ student_id: studentId, date, status, notes: notes || null, arrival_time: arrivalTime || null, departure_time: departureTime || null }, { onConflict: "student_id,date" })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /attendance/:id
router.delete("/:id", requireLevel(70), async (req, res) => {
  const { error } = await supabase.from("attendance").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
