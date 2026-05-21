const express = require("express");
const bcrypt  = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const supabase = require("../lib/supabase");
const { requireAuth, makeTokens } = require("../middleware/auth");

const router = express.Router();
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

const ok = (r) => r.error === null;
const first = (r) => Array.isArray(r.data) ? r.data[0] : r.data;

// POST /auth/login
router.post("/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { email, password } = req.body;
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("active", true)
      .limit(1);

    const user = users?.[0];
    if (error || !user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = makeTokens({
      id: user.id, schoolId: user.school_id, role: user.role, email: user.email,
    });

    await supabase.from("refresh_tokens").insert({
      user_id: user.id, token: refreshToken,
      expires_at: new Date(Date.now() + REFRESH_MS).toISOString(),
    });
    await supabase.from("users").update({ last_login_at: new Date().toISOString() }).eq("id", user.id);
    try { await supabase.from("audit_logs").insert({ school_id: user.school_id, user_id: user.id, action: "LOGIN", entity: "User", entity_id: user.id }); } catch {}

    res.json({
      accessToken, refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, schoolId: user.school_id },
    });
  }
);

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

  const { data: tokens } = await supabase.from("refresh_tokens").select("*, users(*)").eq("token", refreshToken).limit(1);
  const stored = tokens?.[0];
  if (!stored || new Date(stored.expires_at) < new Date()) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  const newTokens = makeTokens({ id: stored.users.id, schoolId: stored.users.school_id, role: stored.users.role, email: stored.users.email });
  await supabase.from("refresh_tokens").delete().eq("id", stored.id);
  await supabase.from("refresh_tokens").insert({
    user_id: stored.user_id, token: newTokens.refreshToken,
    expires_at: new Date(Date.now() + REFRESH_MS).toISOString(),
  });

  res.json({ accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken });
});

// POST /auth/logout
router.post("/logout", requireAuth, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await supabase.from("refresh_tokens").delete().eq("token", refreshToken);
  res.json({ ok: true });
});

// GET /auth/me
router.get("/me", requireAuth, async (req, res) => {
  const { data } = await supabase.from("users").select("id,name,email,role,avatar,school_id,last_login_at,created_at").eq("id", req.user.userId).limit(1);
  const user = data?.[0];
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ ...user, schoolId: user.school_id });
});

// PUT /auth/change-password
router.put("/change-password",
  requireAuth,
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 6 }),
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });

    const { data } = await supabase.from("users").select("*").eq("id", req.user.userId).limit(1);
    const user = data?.[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!(await bcrypt.compare(req.body.currentPassword, user.password_hash))) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    const password_hash = await bcrypt.hash(req.body.newPassword, 12);
    await supabase.from("users").update({ password_hash }).eq("id", user.id);
    await supabase.from("refresh_tokens").delete().eq("user_id", user.id);
    res.json({ ok: true });
  }
);

module.exports = router;
