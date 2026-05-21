const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireLevel, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

// GET /staff?active=&role=
router.get("/", async (req, res) => {
  const { active, role } = req.query;
  let q = supabase.from("staff").select("*").eq("school_id", req.schoolId).order("first_name");
  if (active !== undefined) q = q.eq("active", active === "true" || active === true);
  if (role)   q = q.eq("role", role);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /staff/:id
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("staff").select("*").eq("id", req.params.id).eq("school_id", req.schoolId).single();
  if (error) return res.status(404).json({ error: "Staff member not found" });
  res.json({ data });
});

// POST /staff
router.post("/", requireLevel(70), async (req, res) => {
  const { firstName, lastName, email, phone, role, joinedAt, notes } = req.body;
  if (!firstName || !role) return res.status(400).json({ error: "firstName and role required" });
  const { data, error } = await supabase.from("staff").insert({
    school_id:  req.schoolId,
    first_name: firstName,
    last_name:  lastName || "",
    email:      email    || null,
    phone:      phone    || null,
    role,
    joined_at:  joinedAt || null,
    active:     true,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// PUT /staff/:id
router.put("/:id", requireLevel(60), async (req, res) => {
  const { firstName, lastName, email, phone, role, joinedAt, active } = req.body;
  const patch = { updated_at: new Date().toISOString() };
  if (firstName !== undefined) patch.first_name = firstName;
  if (lastName  !== undefined) patch.last_name  = lastName;
  if (email     !== undefined) patch.email      = email || null;
  if (phone     !== undefined) patch.phone      = phone || null;
  if (role      !== undefined) patch.role       = role;
  if (joinedAt  !== undefined) patch.joined_at  = joinedAt || null;
  if (active    !== undefined) patch.active     = active;
  const { data, error } = await supabase.from("staff").update(patch).eq("id", req.params.id).eq("school_id", req.schoolId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /staff/:id
router.delete("/:id", requireLevel(80), async (req, res) => {
  const { error } = await supabase.from("staff").delete().eq("id", req.params.id).eq("school_id", req.schoolId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
