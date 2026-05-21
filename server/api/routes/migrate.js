const express = require("express");
const bcrypt   = require("bcrypt");
const supabase = require("../lib/supabase");
const { requireAuth } = require("../middleware/auth");
const { requireRole, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool, requireRole("SUPERADMIN"));

const STATUS_MAP   = { new:"NEW", contacted:"CONTACTED", visit:"VISIT_BOOKED", meeting:"MEETING_DONE", enrolled:"ENROLLED", cold:"COLD" };
const PRIORITY_MAP = { low:"LOW", medium:"MEDIUM", high:"HIGH" };

// POST /migrate/leads
router.post("/leads", async (req, res) => {
  const { leads } = req.body;
  if (!Array.isArray(leads)) return res.status(400).json({ error: "leads must be an array" });
  let created = 0, skipped = 0;
  for (const l of leads) {
    try {
      const { data: lead, error } = await supabase.from("leads").insert({
        school_id:        req.schoolId,
        name:             l.name || "Unknown",
        email:            l.email || null,
        phone:            l.phone || null,
        whatsapp:         l.whatsapp || null,
        child_name:       l.childName || null,
        child_age:        l.childAge || null,
        program_interest: l.programInterest || null,
        source:           l.source || "migration",
        message:          l.message || null,
        status:           STATUS_MAP[l.status] || "NEW",
        priority:         PRIORITY_MAP[l.priority] || "MEDIUM",
        tags:             Array.isArray(l.tags) ? l.tags : [],
        notes:            l.notes || null,
        created_at:       l.createdAt || new Date().toISOString(),
      }).select("id").single();
      if (error) { skipped++; continue; }
      if (Array.isArray(l.contactHistory)) {
        const acts = l.contactHistory.map(h => ({
          lead_id: lead.id,
          type:    h.type || "note",
          note:    h.note || h.text || null,
          date:    h.date || new Date().toISOString(),
        }));
        if (acts.length) try { await supabase.from("lead_activities").insert(acts); } catch {}
      }
      created++;
    } catch { skipped++; }
  }
  res.json({ ok: true, created, skipped });
});

// POST /migrate/users
router.post("/users", async (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users)) return res.status(400).json({ error: "users must be an array" });
  let created = 0, skipped = 0;
  const roleMap = { superadmin:"SUPERADMIN", editor:"EDITOR", crm:"CRM_AGENT", viewer:"VIEWER" };
  for (const u of users) {
    if (!u.email) { skipped++; continue; }
    const { data: ex } = await supabase.from("users").select("id").eq("school_id", req.schoolId).eq("email", u.email.toLowerCase()).limit(1);
    if (ex?.length) { skipped++; continue; }
    try {
      const password_hash = await bcrypt.hash(u.password || "changeme123", 12);
      const { error } = await supabase.from("users").insert({
        school_id:     req.schoolId,
        name:          u.name || u.email,
        email:         u.email.toLowerCase(),
        password_hash,
        role:          roleMap[u.role] || "VIEWER",
        avatar:        u.avatar || "👤",
        active:        u.active !== false,
        last_login_at: u.lastLogin || null,
        created_at:    u.createdAt || new Date().toISOString(),
      });
      if (error) { skipped++; } else { created++; }
    } catch { skipped++; }
  }
  res.json({ ok: true, created, skipped });
});

module.exports = router;
