const express = require("express");
const bcrypt   = require("bcrypt");
const { body, validationResult } = require("express-validator");
const supabase  = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const { requireRole, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

const pub = (u) => ({
  id: u.id, name: u.name, email: u.email, role: u.role,
  avatar: u.avatar, active: u.active, lastLoginAt: u.last_login_at,
  createdAt: u.created_at, schoolId: u.school_id,
});

// GET /users
router.get("/", requireRole("SUPERADMIN", "PRINCIPAL"), async (req, res) => {
  const { data, error } = await supabase.from("users").select("*").eq("school_id", req.schoolId).order("created_at");
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map(pub));
});

// POST /users
router.post("/",
  requireRole("SUPERADMIN"),
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { name, email, password, role, avatar } = req.body;
    const { data: existing } = await supabase.from("users").select("id").eq("school_id", req.schoolId).eq("email", email).limit(1);
    if (existing?.length) return res.status(409).json({ error: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from("users").insert({
      school_id: req.schoolId, name, email, password_hash,
      role: (role || "EDITOR").toUpperCase(), avatar: avatar || "👤",
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(pub(data));
  }
);

// PUT /users/:id
router.put("/:id", requireRole("SUPERADMIN"), async (req, res) => {
  const { data: existing } = await supabase.from("users").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!existing?.length) return res.status(404).json({ error: "User not found" });
  if (req.params.id === req.user.userId && req.body.active === false) {
    return res.status(400).json({ error: "Cannot deactivate your own account" });
  }

  const patch = {};
  const b = req.body;
  if (b.name  !== undefined) patch.name   = b.name;
  if (b.role  !== undefined) patch.role   = b.role.toUpperCase();
  if (b.avatar !== undefined) patch.avatar = b.avatar;
  if (b.active !== undefined) patch.active = b.active;

  const { data, error } = await supabase.from("users").update(patch).eq("id", req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(pub(data));
});

// DELETE /users/:id
router.delete("/:id", requireRole("SUPERADMIN"), async (req, res) => {
  if (req.params.id === req.user.userId) return res.status(400).json({ error: "Cannot delete your own account" });
  const { data: existing } = await supabase.from("users").select("id").eq("id", req.params.id).eq("school_id", req.schoolId).limit(1);
  if (!existing?.length) return res.status(404).json({ error: "User not found" });
  await supabase.from("users").delete().eq("id", req.params.id);
  res.json({ ok: true });
});

module.exports = router;
