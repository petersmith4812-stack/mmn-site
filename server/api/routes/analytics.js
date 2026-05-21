const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }    = require("../middleware/auth");
const { injectSchool }   = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

// ── helpers ────────────────────────────────────────────────────────────────────

async function getSchoolStudentIds(schoolId) {
  const { data } = await supabase.from("students").select("id").eq("school_id", schoolId);
  return (data || []).map(s => s.id);
}

// ── GET /analytics/overview ────────────────────────────────────────────────────
// Summary cards: total students, active staff, monthly revenue, avg attendance rate
router.get("/overview", async (req, res) => {
  try {
    const sid = req.schoolId;

    // Students
    const { data: students } = await supabase.from("students")
      .select("id, status, enrolled_at, program_type")
      .eq("school_id", sid);
    const totalStudents  = (students || []).length;
    const activeStudents = (students || []).filter(s => ["active","enrolled"].includes(s.status)).length;

    // Staff
    const { data: staff } = await supabase.from("staff").select("id, active").eq("school_id", sid);
    const activeStaff = (staff || []).filter(s => s.active).length;

    // Revenue this month
    const thisMonth = new Date().toISOString().slice(0, 7);
    const { data: invoices } = await supabase.from("invoices")
      .select("amount, status")
      .eq("school_id", sid)
      .eq("month", thisMonth);
    const monthlyRevenue  = (invoices || []).filter(i => i.status === "PAID").reduce((s, i) => s + Number(i.amount || 0), 0);
    const monthlyInvoiced = (invoices || []).reduce((s, i) => s + Number(i.amount || 0), 0);

    // Attendance rate (last 30 days)
    const studentIds = (students || []).map(s => s.id);
    let attendanceRate = null;
    if (studentIds.length > 0) {
      const from = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const { data: att } = await supabase.from("attendance")
        .select("status").in("student_id", studentIds).gte("date", from);
      if (att && att.length > 0) {
        const present = att.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
        attendanceRate = Math.round((present / att.length) * 100);
      }
    }

    // New enrollments this month
    const newEnrollments = (students || []).filter(s => (s.enrolled_at || "").startsWith(thisMonth)).length;

    res.json({
      data: {
        totalStudents, activeStudents, activeStaff,
        monthlyRevenue, monthlyInvoiced,
        attendanceRate, newEnrollments,
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /analytics/enrollment?months=6 ─────────────────────────────────────────
// Monthly enrollment counts for trend chart
router.get("/enrollment", async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 6, 24);
    const { data: students } = await supabase.from("students")
      .select("enrolled_at, status, program_type").eq("school_id", req.schoolId);

    const buckets = {};
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      buckets[key] = { month: key, enrolled: 0, byProgram: {} };
    }

    (students || []).forEach(s => {
      const m = (s.enrolled_at || "").slice(0, 7);
      if (buckets[m]) {
        buckets[m].enrolled++;
        buckets[m].byProgram[s.program_type] = (buckets[m].byProgram[s.program_type] || 0) + 1;
      }
    });

    res.json({ data: Object.values(buckets) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /analytics/attendance?weeks=8 ──────────────────────────────────────────
// Weekly attendance rates
router.get("/attendance", async (req, res) => {
  try {
    const weeks = Math.min(parseInt(req.query.weeks) || 8, 26);
    const studentIds = await getSchoolStudentIds(req.schoolId);
    if (studentIds.length === 0) return res.json({ data: [] });

    const from = new Date(Date.now() - weeks * 7 * 86400000).toISOString().slice(0, 10);
    const { data: att } = await supabase.from("attendance")
      .select("date, status").in("student_id", studentIds).gte("date", from).order("date");

    // Group by week (Mon start)
    const byWeek = {};
    (att || []).forEach(r => {
      const d   = new Date(r.date);
      const day = d.getDay();
      const mon = new Date(d);
      mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const key = mon.toISOString().slice(0, 10);
      if (!byWeek[key]) byWeek[key] = { week: key, total: 0, present: 0 };
      byWeek[key].total++;
      if (r.status === "PRESENT" || r.status === "LATE") byWeek[key].present++;
    });

    const result = Object.values(byWeek).map(w => ({
      ...w,
      rate: w.total > 0 ? Math.round((w.present / w.total) * 100) : null,
    })).sort((a, b) => a.week.localeCompare(b.week));

    res.json({ data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /analytics/finance?months=6 ────────────────────────────────────────────
// Monthly revenue collected vs invoiced
router.get("/finance", async (req, res) => {
  try {
    const months = Math.min(parseInt(req.query.months) || 6, 24);
    const { data: invoices } = await supabase.from("invoices")
      .select("month, amount, status").eq("school_id", req.schoolId);

    const buckets = {};
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      buckets[key] = { month: key, invoiced: 0, collected: 0, pending: 0, overdue: 0 };
    }

    (invoices || []).forEach(inv => {
      const m = (inv.month || "").slice(0, 7);
      if (!buckets[m]) return;
      const amt = Number(inv.amount || 0);
      buckets[m].invoiced  += amt;
      if (inv.status === "PAID")                          buckets[m].collected += amt;
      if (["DRAFT","SENT"].includes(inv.status))          buckets[m].pending   += amt;
      if (inv.status === "OVERDUE")                       buckets[m].overdue   += amt;
    });

    res.json({ data: Object.values(buckets) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /analytics/behaviour?days=30 ───────────────────────────────────────────
// Behaviour log breakdown by category and setting
router.get("/behaviour", async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 365);
    const studentIds = await getSchoolStudentIds(req.schoolId);
    if (studentIds.length === 0) return res.json({ data: { byCategory: {}, bySetting: {}, trend: [] } });

    const from = new Date(Date.now() - days * 86400000).toISOString();
    const { data: logs } = await supabase.from("behaviour_logs")
      .select("category, setting, observed_at, created_at")
      .in("student_id", studentIds).gte("observed_at", from);

    const byCategory = {}, bySetting = {};
    (logs || []).forEach(l => {
      byCategory[l.category] = (byCategory[l.category] || 0) + 1;
      if (l.setting) bySetting[l.setting] = (bySetting[l.setting] || 0) + 1;
    });

    // Weekly trend
    const byWeek = {};
    (logs || []).forEach(l => {
      const d   = new Date(l.observed_at || l.created_at);
      const day = d.getDay();
      const mon = new Date(d);
      mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      const key = mon.toISOString().slice(0, 10);
      if (!byWeek[key]) byWeek[key] = { week: key, POSITIVE: 0, CHALLENGING: 0, NEUTRAL: 0 };
      byWeek[key][l.category] = (byWeek[key][l.category] || 0) + 1;
    });

    res.json({
      data: {
        byCategory, bySetting,
        trend: Object.values(byWeek).sort((a, b) => a.week.localeCompare(b.week)),
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /analytics/students/breakdown ──────────────────────────────────────────
// Students by program, status, age group
router.get("/students/breakdown", async (req, res) => {
  try {
    const { data: students } = await supabase.from("students")
      .select("status, program_type, date_of_birth").eq("school_id", req.schoolId);

    const byStatus  = {}, byProgram = {}, byAge = {};
    const today     = new Date();

    (students || []).forEach(s => {
      byStatus[s.status]       = (byStatus[s.status]       || 0) + 1;
      byProgram[s.program_type] = (byProgram[s.program_type] || 0) + 1;

      if (s.date_of_birth) {
        const age = today.getFullYear() - new Date(s.date_of_birth).getFullYear();
        const ageGroup = age <= 2 ? "0-2" : age <= 3 ? "3" : age <= 4 ? "4" : age <= 5 ? "5" : "6+";
        byAge[ageGroup] = (byAge[ageGroup] || 0) + 1;
      }
    });

    res.json({ data: { byStatus, byProgram, byAge, total: (students || []).length } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
