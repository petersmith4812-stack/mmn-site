const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }          = require("../middleware/auth");
const { requireLevel, requireRole, injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

// ── Fee Structures ────────────────────────────────────────────────────────────

// GET /finance/fees
router.get("/fees", async (req, res) => {
  const { data, error } = await supabase.from("fee_structures")
    .select("*").eq("school_id", req.schoolId).order("program_type");
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// POST /finance/fees
router.post("/fees", requireLevel(70), async (req, res) => {
  const { name, programType, amount, currency, frequency } = req.body;
  if (!name || !programType || !amount) return res.status(400).json({ error: "name, programType, amount required" });
  const { data, error } = await supabase.from("fee_structures").insert({
    school_id:    req.schoolId,
    name,
    program_type: programType,
    amount:       parseFloat(amount),
    currency:     currency || "PKR",
    frequency:    frequency || "monthly",
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// PUT /finance/fees/:id
router.put("/fees/:id", requireLevel(70), async (req, res) => {
  const { name, programType, amount, currency, frequency } = req.body;
  const patch = {};
  if (name        !== undefined) patch.name         = name;
  if (programType !== undefined) patch.program_type = programType;
  if (amount      !== undefined) patch.amount       = parseFloat(amount);
  if (currency    !== undefined) patch.currency     = currency;
  if (frequency   !== undefined) patch.frequency    = frequency;
  const { data, error } = await supabase.from("fee_structures").update(patch).eq("id", req.params.id).eq("school_id", req.schoolId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /finance/fees/:id
router.delete("/fees/:id", requireRole("SUPERADMIN","PRINCIPAL"), async (req, res) => {
  const { error } = await supabase.from("fee_structures").delete().eq("id", req.params.id).eq("school_id", req.schoolId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ── Invoices ──────────────────────────────────────────────────────────────────

// GET /finance/invoices?month=&status=&programType=
router.get("/invoices", async (req, res) => {
  const { month, status, programType } = req.query;
  let q = supabase.from("invoices")
    .select("*, fee_structures(name,program_type,amount), students(id,first_name,last_name,class_id,classes(name))")
    .eq("school_id", req.schoolId)
    .order("created_at", { ascending: false });
  if (month)       q = q.eq("month", month);
  if (status)      q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data: data || [] });
});

// GET /finance/summary?month=
router.get("/summary", async (req, res) => {
  const { month } = req.query;
  let q = supabase.from("invoices").select("status,amount,currency").eq("school_id", req.schoolId);
  if (month) q = q.eq("month", month);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  const rows = data || [];
  const total     = rows.reduce((s, r) => s + parseFloat(r.amount), 0);
  const collected = rows.filter(r => r.status === "PAID").reduce((s, r) => s + parseFloat(r.amount), 0);
  const pending   = rows.filter(r => ["DRAFT","SENT"].includes(r.status)).reduce((s, r) => s + parseFloat(r.amount), 0);
  const overdue   = rows.filter(r => r.status === "OVERDUE").reduce((s, r) => s + parseFloat(r.amount), 0);
  const byStatus  = rows.reduce((m, r) => { m[r.status] = (m[r.status]||0)+1; return m; }, {});
  res.json({ total, collected, pending, overdue, count: rows.length, byStatus });
});

// POST /finance/invoices — create single invoice
router.post("/invoices", requireLevel(70), async (req, res) => {
  const { studentId, studentName, feeStructureId, amount, currency, month, dueDate, notes } = req.body;
  if (!studentName || !amount) return res.status(400).json({ error: "studentName and amount required" });
  const { data, error } = await supabase.from("invoices").insert({
    school_id:        req.schoolId,
    student_id:       studentId || null,
    student_name:     studentName,
    fee_structure_id: feeStructureId || null,
    amount:           parseFloat(amount),
    currency:         currency || "PKR",
    month:            month || null,
    due_date:         dueDate || null,
    notes:            notes || null,
  }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// POST /finance/invoices/generate — bulk generate for a month
router.post("/invoices/generate", requireLevel(70), async (req, res) => {
  const { month, dueDate } = req.body;
  if (!month) return res.status(400).json({ error: "month required (YYYY-MM)" });

  // Get active students with their program type
  const { data: students } = await supabase.from("students")
    .select("id,first_name,last_name,program_type").eq("school_id", req.schoolId)
    .in("status", ["ACTIVE","ENROLLED"]);

  // Get fee structures
  const { data: fees } = await supabase.from("fee_structures").select("*").eq("school_id", req.schoolId);

  let created = 0, skipped = 0;
  for (const s of (students || [])) {
    if (!s.program_type) { skipped++; continue; }
    const fee = (fees || []).find(f => f.program_type === s.program_type);
    if (!fee) { skipped++; continue; }

    // Check if already generated
    const { data: existing } = await supabase.from("invoices")
      .select("id").eq("school_id", req.schoolId).eq("student_id", s.id).eq("month", month).limit(1);
    if (existing?.length) { skipped++; continue; }

    const { error } = await supabase.from("invoices").insert({
      school_id:        req.schoolId,
      student_id:       s.id,
      student_name:     `${s.first_name} ${s.last_name}`,
      fee_structure_id: fee.id,
      amount:           fee.amount,
      currency:         fee.currency,
      month,
      due_date:         dueDate || null,
    });
    if (error) skipped++; else created++;
  }
  res.json({ ok: true, created, skipped, total: (students||[]).length });
});

// PUT /finance/invoices/:id
router.put("/invoices/:id", requireLevel(60), async (req, res) => {
  const { status, paidAt, dueDate, notes, amount } = req.body;
  const patch = { updated_at: new Date().toISOString() };
  if (status  !== undefined) patch.status   = status;
  if (paidAt  !== undefined) patch.paid_at  = paidAt;
  if (dueDate !== undefined) patch.due_date = dueDate;
  if (notes   !== undefined) patch.notes    = notes;
  if (amount  !== undefined) patch.amount   = parseFloat(amount);
  if (status === "PAID" && !patch.paid_at) patch.paid_at = new Date().toISOString();
  const { data, error } = await supabase.from("invoices").update(patch).eq("id", req.params.id).eq("school_id", req.schoolId).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ data });
});

// DELETE /finance/invoices/:id
router.delete("/invoices/:id", requireRole("SUPERADMIN","PRINCIPAL"), async (req, res) => {
  const { error } = await supabase.from("invoices").delete().eq("id", req.params.id).eq("school_id", req.schoolId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;
