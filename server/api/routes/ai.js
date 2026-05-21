const express  = require("express");
const supabase = require("../lib/supabase");
const { requireAuth }  = require("../middleware/auth");
const { injectSchool } = require("../middleware/rbac");

const router = express.Router();
router.use(requireAuth, injectSchool);

const OPENAI_KEY = () => process.env.OPENAI_API_KEY;

const hasAI = () => !!OPENAI_KEY();

// ── POST /ai/chat ──────────────────────────────────────────────────────────────
// General AI assistant chat (requires OpenAI key)
router.post("/chat", async (req, res) => {
  if (!hasAI()) return res.status(503).json({ error: "AI not configured", hint: "Set OPENAI_API_KEY in server/.env" });

  const { messages, systemPrompt } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages array required" });

  try {
    const fetch = globalThis.fetch;
    const body  = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt || "You are an expert early years education assistant helping teachers at a preschool called Mini Muslims Nest (MMN). Be concise, practical, and supportive." },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
    };
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const err = await r.text();
      return res.status(r.status).json({ error: "OpenAI error", detail: err });
    }
    const data = await r.json();
    res.json({ reply: data.choices?.[0]?.message?.content || "", usage: data.usage });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /ai/lesson-plan ───────────────────────────────────────────────────────
// Generate a lesson plan for a given subject + date + objectives
router.post("/lesson-plan", async (req, res) => {
  if (!hasAI()) return res.status(503).json({ error: "AI not configured", hint: "Set OPENAI_API_KEY in server/.env" });

  const { subject, ageGroup, duration, learningObjectives, islamicTheme } = req.body;
  if (!subject) return res.status(400).json({ error: "subject required" });

  const prompt = `Create a detailed lesson plan for a preschool class at Mini Muslims Nest (MMN), an Islamic early years school.

Subject: ${subject}
Age Group: ${ageGroup || "3-5 years"}
Duration: ${duration || "30 minutes"}
${islamicTheme ? `Islamic Theme/Value to incorporate: ${islamicTheme}` : ""}
${learningObjectives ? `Learning Objectives: ${learningObjectives}` : ""}

Provide a structured lesson plan with:
1. Learning Objectives (3-4 bullet points)
2. Resources/Materials needed
3. Activities (intro, main activity, plenary — each with timing)
4. Assessment ideas
5. Differentiation strategies (support/extend)
6. Islamic integration (how to naturally weave in Islamic values)

Be practical, age-appropriate, and engaging. Format clearly.`;

  try {
    const fetch = globalThis.fetch;
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, max_tokens: 2000,
      }),
    });
    if (!r.ok) return res.status(r.status).json({ error: "OpenAI error" });
    const data = await r.json();
    res.json({ plan: data.choices?.[0]?.message?.content || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /ai/behaviour-insight ─────────────────────────────────────────────────
// Analyse a student's behaviour logs and suggest CBT/ABA strategies
router.post("/behaviour-insight", async (req, res) => {
  if (!hasAI()) return res.status(503).json({ error: "AI not configured", hint: "Set OPENAI_API_KEY in server/.env" });

  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  // Verify student belongs to school
  const { data: student } = await supabase.from("students").select("first_name, last_name, date_of_birth").eq("id", studentId).eq("school_id", req.schoolId).single();
  if (!student) return res.status(404).json({ error: "Student not found" });

  // Fetch last 30 days of behaviour logs
  const from = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data: logs } = await supabase.from("behaviour_logs")
    .select("category, setting, antecedent, behaviour, consequence, intensity, notes, observed_at")
    .eq("student_id", studentId).gte("observed_at", from).order("observed_at", { ascending: false }).limit(20);

  if (!logs || logs.length === 0) return res.json({ insight: "Not enough behaviour data for this student in the last 30 days to generate an insight." });

  const summary = logs.map(l =>
    `[${(l.observed_at || "").slice(0,10)}] ${l.category} | Setting: ${l.setting || "N/A"} | Intensity: ${l.intensity || "N/A"}/5\n  A: ${l.antecedent || "N/A"} | B: ${l.behaviour} | C: ${l.consequence || "N/A"}`
  ).join("\n");

  const age = student.date_of_birth
    ? Math.floor((Date.now() - new Date(student.date_of_birth)) / (365.25 * 86400000))
    : null;

  const prompt = `You are an early years SENCO and behaviour specialist. Analyse the following behaviour logs for ${student.first_name} ${student.last_name}${age ? ` (age ${age})` : ""} and provide:

1. Pattern analysis: What triggers, settings, and antecedents appear most frequently?
2. Strengths: What positive behaviours should be reinforced?
3. Strategies: 3-5 practical ABA/CBT-informed strategies for the classroom
4. Parent communication: Key points to discuss with parents
5. Next steps: Specific, measurable targets for the next 2 weeks

Behaviour logs (most recent 20 records, last 30 days):
${summary}

Keep advice practical, compassionate, and grounded in early years best practice. Be specific, not generic.`;

  try {
    const fetch = globalThis.fetch;
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6, max_tokens: 2000,
      }),
    });
    if (!r.ok) return res.status(r.status).json({ error: "OpenAI error" });
    const data = await r.json();
    res.json({ insight: data.choices?.[0]?.message?.content || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── POST /ai/progress-report ───────────────────────────────────────────────────
// Generate a parent-friendly progress narrative from milestone data
router.post("/progress-report", async (req, res) => {
  if (!hasAI()) return res.status(503).json({ error: "AI not configured", hint: "Set OPENAI_API_KEY in server/.env" });

  const { studentId, term } = req.body;
  if (!studentId) return res.status(400).json({ error: "studentId required" });

  const { data: student } = await supabase.from("students")
    .select("first_name, last_name, date_of_birth, program_type").eq("id", studentId).eq("school_id", req.schoolId).single();
  if (!student) return res.status(404).json({ error: "Student not found" });

  const { data: milestones } = await supabase.from("progress_records")
    .select("domain, objective, level, achieved_date, notes").eq("student_id", studentId).order("domain");

  if (!milestones || milestones.length === 0) return res.json({ report: "No progress records found for this student." });

  const byDomain = milestones.reduce((acc, m) => {
    if (!acc[m.domain]) acc[m.domain] = [];
    acc[m.domain].push(`${m.objective} — ${m.level}${m.notes ? ` (${m.notes})` : ""}`);
    return acc;
  }, {});

  const summary = Object.entries(byDomain).map(([d, items]) => `${d}:\n  - ${items.join("\n  - ")}`).join("\n\n");

  const age = student.date_of_birth
    ? Math.floor((Date.now() - new Date(student.date_of_birth)) / (365.25 * 86400000))
    : null;

  const prompt = `Write a warm, encouraging parent-facing progress report for ${student.first_name} ${student.last_name}${age ? ` (age ${age})` : ""} at Mini Muslims Nest Islamic Preschool.${term ? ` Term: ${term}.` : ""}

Progress data across developmental domains:
${summary}

The report should:
- Be written in a warm, professional tone suitable for parents
- Highlight strengths first
- Address areas for development constructively
- Suggest how parents can support at home for each domain
- Include an Islamic closing reflection (e.g., a relevant hadith or dua)
- Be 400-600 words

Structure: Introduction → Domain-by-domain summary → Overall summary → Home support tips → Islamic closing`;

  try {
    const fetch = globalThis.fetch;
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${OPENAI_KEY()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, max_tokens: 2500,
      }),
    });
    if (!r.ok) return res.status(r.status).json({ error: "OpenAI error" });
    const data = await r.json();
    res.json({ report: data.choices?.[0]?.message?.content || "" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /ai/status ─────────────────────────────────────────────────────────────
router.get("/status", (_req, res) => {
  res.json({ configured: hasAI(), model: hasAI() ? "gpt-4o-mini" : null });
});

module.exports = router;
