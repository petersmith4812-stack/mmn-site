const express = require("express");
const bcrypt  = require("bcrypt");
const jwt     = require("jsonwebtoken");
const supabase = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireRole, requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mmn-jwt-secret-please-change";

// ── Parent auth middleware ────────────────────────────────────────────────────
const requireParentAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Auth required" });
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET);
    if (payload.type !== "parent") return res.status(401).json({ error: "Invalid token type" });
    req.parent = payload;
    next();
  } catch { return res.status(401).json({ error: "Invalid or expired token" }); }
};

// ── Public: POST /parents/login ──────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const { data: parent, error } = await supabase.from("parents")
    .select("*, student_parents(student_id, is_primary, relation, students(id,first_name,last_name,class_id,school_id,classes(id,name,color)))")
    .eq("email", email.toLowerCase().trim())
    .eq("portal_enabled", true)
    .limit(1).single();

  if (error || !parent) return res.status(401).json({ error: "Invalid credentials or portal not enabled" });
  if (!parent.portal_password_hash) return res.status(401).json({ error: "Portal password not set. Contact the school." });

  const valid = await bcrypt.compare(password, parent.portal_password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  const students = (parent.student_parents || []).map(sp => ({
    id:        sp.students?.id,
    firstName: sp.students?.first_name,
    lastName:  sp.students?.last_name,
    classId:   sp.students?.class_id,
    schoolId:  sp.students?.school_id,
    class:     sp.students?.classes || null,
    relation:  sp.relation,
    isPrimary: sp.is_primary,
  })).filter(s => s.id);

  const schoolId = students[0]?.schoolId || null;
  const studentIds = students.map(s => s.id);

  const token = jwt.sign(
    { type:"parent", parentId: parent.id, schoolId, studentIds, email: parent.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    ok: true,
    token,
    parent: { id: parent.id, firstName: parent.first_name, lastName: parent.last_name, email: parent.email },
    students,
  });
});

// ── Parent self-service routes (require parent JWT) ───────────────────────────

// GET /parents/me
router.get("/me", requireParentAuth, async (req, res) => {
  const { data, error } = await supabase.from("parents")
    .select("id,first_name,last_name,email,phone,whatsapp")
    .eq("id", req.parent.parentId).single();
  if (error) return res.status(404).json({ error: "Parent not found" });
  const unread = await supabase.from("parent_messages").select("id", { count: "exact" })
    .eq("parent_id", req.parent.parentId).eq("is_read", false);
  res.json({ data, unreadMessages: unread.count || 0 });
});

// GET /parents/me/attendance?studentId=&from=&to=
router.get("/me/attendance", requireParentAuth, async (req, res) => {
  const { studentId, from, to } = req.query;
  const sid = studentId || req.parent.studentIds?.[0];
  if (!sid || !req.parent.studentIds?.includes(sid)) return res.status(403).json({ error: "Access denied" });
  let q = supabase.from("attendance").select("*").eq("student_id", sid).order("date", { ascending: false });
  if (from) q = q.gte("date", from);
  if (to)   q = q.lte("date", to);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /parents/me/progress?studentId=
router.get("/me/progress", requireParentAuth, async (req, res) => {
  const { studentId } = req.query;
  const sid = studentId || req.parent.studentIds?.[0];
  if (!sid || !req.parent.studentIds?.includes(sid)) return res.status(403).json({ error: "Access denied" });
  const { data, error } = await supabase.from("progress_records")
    .select("*").eq("student_id", sid).order("observed_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /parents/me/nutrition?studentId=&date=
router.get("/me/nutrition", requireParentAuth, async (req, res) => {
  const { studentId, date } = req.query;
  const sid = studentId || req.parent.studentIds?.[0];
  if (!sid || !req.parent.studentIds?.includes(sid)) return res.status(403).json({ error: "Access denied" });
  let q = supabase.from("nutrition_logs").select("*").eq("student_id", sid).order("date", { ascending: false });
  if (date) q = q.eq("date", date);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /parents/me/behaviour?studentId=&from=&to=  (positive only)
router.get("/me/behaviour", requireParentAuth, async (req, res) => {
  const { studentId, from, to } = req.query;
  const sid = studentId || req.parent.studentIds?.[0];
  if (!sid || !req.parent.studentIds?.includes(sid)) return res.status(403).json({ error: "Access denied" });
  let q = supabase.from("behaviour_logs").select("*")
    .eq("student_id", sid).eq("category", "POSITIVE").order("observed_at", { ascending: false }).limit(30);
  if (from) q = q.gte("observed_at", from);
  if (to)   q = q.lte("observed_at", to + "T23:59:59Z");
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /parents/me/messages
router.get("/me/messages", requireParentAuth, async (req, res) => {
  const { data, error } = await supabase.from("parent_messages")
    .select("*, students(first_name,last_name)")
    .eq("parent_id", req.parent.parentId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return res.status(500).json({ error: error.message });
  // Mark all as read
  await supabase.from("parent_messages").update({ is_read: true })
    .eq("parent_id", req.parent.parentId).eq("is_read", false);
  res.json({ data: data || [] });
});

// ── Admin parent management (require admin JWT) ───────────────────────────────

// GET /parents — list all parents for school
router.get("/", requireAuth, injectSchool, requireLevel(50), async (req, res) => {
  const { data, error } = await supabase.from("parents")
    .select("*, student_parents(relation, is_primary, students(id,first_name,last_name))")
    .eq("school_id", req.schoolId)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /parents/:id
router.get("/:id", requireAuth, injectSchool, requireLevel(50), async (req, res) => {
  const { data, error } = await supabase.from("parents")
    .select("*, student_parents(relation, is_primary, students(id,first_name,last_name))")
    .eq("id", req.params.id).eq("school_id", req.schoolId).single();
  if (error) return res.status(404).json({ error: "Parent not found" });
  res.json({ data });
});

// PUT /parents/:id/portal — enable/disable portal + set password
router.put("/:id/portal", requireAuth, injectSchool, requireLevel(60), async (req, res) => {
  const { enabled, password } = req.body;
  const patch = { portal_enabled: !!enabled };
  if (enabled && password) {
    patch.portal_password_hash = await bcrypt.hash(password, 12);
  } else if (!enabled) {
    patch.portal_password_hash = null;
  }
  const { data, error } = await supabase.from("parents")
    .update(patch).eq("id", req.params.id).eq("school_id", req.schoolId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, data });
});

// POST /parents/:id/message — send message to parent
router.post("/:id/message", requireAuth, injectSchool, requireLevel(50), async (req, res) => {
  const { subject, body, studentId } = req.body;
  if (!subject || !body) return res.status(400).json({ error: "subject and body required" });
  const { data: parent } = await supabase.from("parents").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!parent?.length) return res.status(404).json({ error: "Parent not found" });
  const { data, error } = await supabase.from("parent_messages").insert({
    school_id:  req.schoolId,
    parent_id:  req.params.id,
    student_id: studentId || null,
    sender_id:  req.user.userId,
    subject,
    body,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, data });
});

module.exports = router;
