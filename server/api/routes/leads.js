const express = require("express");
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const { requireLevel, requireRole, injectSchool } = require("../middleware/rbac");

const router = express.Router();

// Public lead submission (contact form / exit popup)
router.post("/public", async (req, res) => {
  const { name, email, phone, whatsapp, childName, childAge, programInterest, source, message } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const schoolId = process.env.SCHOOL_ID;
  if (!schoolId) return res.status(503).json({ error: "School not configured — run setup.js" });
  const { data, error } = await supabase.from("leads").insert({
    school_id: schoolId, name, email, phone, whatsapp,
    child_name: childName, child_age: childAge,
    program_interest: programInterest, source, message,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ id: data.id });
});

router.use(requireAuth, injectSchool);

// GET /leads
router.get("/", requireLevel(40), async (req, res) => {
  const { status, priority, q, page = 1, limit = 100 } = req.query;
  let query = supabase
    .from("leads")
    .select("*, lead_activities(id,type,note,date ORDER BY date DESC LIMIT 5)", { count: "exact" })
    .eq("school_id", req.schoolId)
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status)   query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (q)        query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,child_name.ilike.%${q}%`);

  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ total: count || 0, page: parseInt(page), leads: data || [] });
});

// POST /leads (admin)
router.post("/", requireLevel(40), async (req, res) => {
  const { name, email, phone, whatsapp, childName, childAge, programInterest, source, message, status, priority, tags } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  const { data, error } = await supabase.from("leads").insert({
    school_id: req.schoolId, name, email, phone, whatsapp,
    child_name: childName, child_age: childAge, program_interest: programInterest,
    source, message, status: status || "NEW", priority: priority || "MEDIUM",
    tags: tags || [],
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /leads/:id
router.put("/:id", requireLevel(40), async (req, res) => {
  const { data: existing } = await supabase.from("leads").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!existing?.length) return res.status(404).json({ error: "Lead not found" });

  const map = {
    name:"name", email:"email", phone:"phone", whatsapp:"whatsapp",
    childName:"child_name", childAge:"child_age", programInterest:"program_interest",
    source:"source", message:"message", status:"status", priority:"priority",
    tags:"tags", notes:"notes", visitDate:"visit_date", followUpDate:"follow_up_date",
  };
  const patch = { updated_at: new Date().toISOString() };
  Object.entries(map).forEach(([js, db]) => {
    if (req.body[js] !== undefined) patch[db] = req.body[js];
  });

  const { data, error } = await supabase.from("leads").update(patch).eq("id", req.params.id)
    .select("*, lead_activities(*)").single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /leads/:id/activity
router.post("/:id/activity", requireLevel(40), async (req, res) => {
  const { data: lead } = await supabase.from("leads").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!lead?.length) return res.status(404).json({ error: "Lead not found" });
  const { type, note } = req.body;
  const { data, error } = await supabase.from("lead_activities").insert({ lead_id: req.params.id, type, note }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await supabase.from("leads").update({ updated_at: new Date().toISOString() }).eq("id", req.params.id);
  res.status(201).json(data);
});

// DELETE /leads/:id
router.delete("/:id", requireRole("SUPERADMIN", "CRM_AGENT", "PRINCIPAL"), async (req, res) => {
  const { data: existing } = await supabase.from("leads").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!existing?.length) return res.status(404).json({ error: "Lead not found" });
  await supabase.from("leads").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

module.exports = router;
