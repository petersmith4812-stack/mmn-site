import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchAIStatus, aiChat, generateLessonPlan, getBehaviourInsight, generateProgressReport } from "../../../api/ai";
import { fetchStudents } from "../../../api/students";

const TABS = [
  { id: "chat",     icon: "💬", label: "AI Assistant" },
  { id: "lesson",   icon: "📚", label: "Lesson Planner" },
  { id: "behaviour",icon: "🧠", label: "Behaviour Insight" },
  { id: "report",   icon: "📄", label: "Progress Report" },
];

const SUBJECTS = ["Literacy","Numeracy","Islamic Studies","Arabic","Physical Education","Art & Craft","Science","Circle Time","Outdoor Play"];
const ISLAMIC_THEMES = ["Bismillah","Alhamdulillah","Patience (Sabr)","Kindness (Rahma)","Sharing","Honesty","Gratitude","Prayer (Salah)","Cleanliness (Taharah)","Respect"];

function NotConfiguredBanner() {
  return (
    <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12, padding: 20, margin: "0 0 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ fontSize: 28 }}>🔑</div>
      <div>
        <div style={{ fontWeight: 700, color: "#92400e", marginBottom: 4 }}>OpenAI API Key Not Configured</div>
        <div style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>
          AI features are ready but need your OpenAI API key to activate. Once you provide the key:<br/>
          <strong>1.</strong> Add <code style={{ background: "#fef3c7", padding: "1px 4px", borderRadius: 3 }}>OPENAI_API_KEY=sk-...</code> to <code style={{ background: "#fef3c7", padding: "1px 4px", borderRadius: 3 }}>server/.env</code><br/>
          <strong>2.</strong> Restart the API server<br/>
          All AI features will activate automatically — no code changes needed.
        </div>
      </div>
    </div>
  );
}

// ── Chat Tab ───────────────────────────────────────────────────────────────────
function ChatTab({ configured }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Assalamu Alaikum! I'm your MMN AI assistant. I can help you with lesson planning, behaviour strategies, parent communication, Islamic activity ideas, and much more. How can I help today?" }
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const chatM = useMutation({
    mutationFn: (msgs) => aiChat(msgs),
    onSuccess: (data) => setMessages(p => [...p, { role: "assistant", content: data.reply }]),
    onError: (e) => setMessages(p => [...p, { role: "assistant", content: `Error: ${e.response?.data?.error || e.message}` }]),
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim() || chatM.isPending) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages(p => [...p, userMsg]);
    setInput("");
    chatM.mutate([...messages, userMsg].filter(m => m.role !== "assistant" || messages.indexOf(m) > 0));
  };

  const SUGGESTIONS = [
    "Suggest an Islamic craft activity for 3-4 year olds about Ramadan",
    "How do I support a child with separation anxiety?",
    "Give me 5 outdoor play ideas that teach counting",
    "Write a weekly newsletter intro for parents",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)" }}>
      {!configured && <NotConfiguredBanner />}

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setInput(s)} style={{
              padding: "6px 12px", borderRadius: 20, border: "1px solid #e2e8f0",
              background: "#f8fafc", fontSize: 12, color: "#475569", cursor: "pointer", textAlign: "left",
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", background: "#f8fafc", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 2 }}>🕌</div>
            )}
            <div style={{
              maxWidth: "75%", padding: "10px 14px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? "#6366f1" : "#fff",
              color: m.role === "user" ? "#fff" : "#1e293b",
              fontSize: 14, lineHeight: 1.6, boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              whiteSpace: "pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {chatM.isPending && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🕌</div>
            <div style={{ background: "#fff", padding: "10px 16px", borderRadius: "18px 18px 18px 4px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", animation: `bounce 1s ease ${i * 0.15}s infinite` }}/>)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={configured ? "Ask anything about early years education..." : "Configure OpenAI API key to enable chat"}
          disabled={!configured || chatM.isPending}
          style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }}
        />
        <button onClick={send} disabled={!configured || !input.trim() || chatM.isPending} style={{
          padding: "12px 20px", borderRadius: 12, border: "none",
          background: configured ? "#6366f1" : "#e2e8f0",
          color: configured ? "#fff" : "#94a3b8",
          fontWeight: 700, fontSize: 14, cursor: configured ? "pointer" : "not-allowed",
        }}>Send</button>
      </div>
    </div>
  );
}

// ── Lesson Planner Tab ─────────────────────────────────────────────────────────
function LessonPlannerTab({ configured }) {
  const [form, setForm] = useState({ subject: "Literacy", ageGroup: "3-4 years", duration: "30 minutes", learningObjectives: "", islamicTheme: "" });
  const [result, setResult] = useState("");

  const genM = useMutation({
    mutationFn: generateLessonPlan,
    onSuccess: (d) => setResult(d.plan || ""),
    onError: (e) => setResult(`Error: ${e.response?.data?.error || e.message}`),
  });

  return (
    <div>
      {!configured && <NotConfiguredBanner />}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
        {[
          { key: "subject", label: "Subject", type: "select", options: SUBJECTS },
          { key: "ageGroup", label: "Age Group", type: "select", options: ["2-3 years","3-4 years","4-5 years","5-6 years","Mixed ages"] },
          { key: "duration", label: "Duration", type: "select", options: ["20 minutes","30 minutes","45 minutes","60 minutes"] },
          { key: "islamicTheme", label: "Islamic Theme (optional)", type: "select", options: ["None",...ISLAMIC_THEMES] },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>{f.label}</label>
            <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{
              width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14,
            }}>
              {f.options.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Specific Learning Objectives (optional)</label>
          <textarea
            value={form.learningObjectives} onChange={e => setForm(p => ({ ...p, learningObjectives: e.target.value }))}
            placeholder="e.g. Children will be able to identify the letters of their name, sort objects by colour..."
            rows={2}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
          />
        </div>
      </div>
      <button onClick={() => genM.mutate(form)} disabled={!configured || genM.isPending} style={{
        padding: "11px 24px", borderRadius: 8, border: "none",
        background: configured ? "#6366f1" : "#e2e8f0",
        color: configured ? "#fff" : "#94a3b8",
        fontWeight: 700, fontSize: 14, cursor: configured ? "pointer" : "not-allowed",
        marginBottom: 20,
      }}>{genM.isPending ? "✨ Generating..." : "✨ Generate Lesson Plan"}</button>

      {result && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>Generated Lesson Plan</div>
            <button onClick={() => navigator.clipboard.writeText(result)} style={{
              padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0",
              background: "#fff", fontSize: 12, cursor: "pointer", color: "#475569",
            }}>📋 Copy</button>
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, color: "#334155", fontFamily: "inherit" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}

// ── Behaviour Insight Tab ──────────────────────────────────────────────────────
function BehaviourInsightTab({ configured }) {
  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState("");

  const { data: stuData } = useQuery({ queryKey: ["students-all"], queryFn: () => fetchStudents({ status: "ACTIVE" }) });
  const students = stuData?.students || [];

  const insightM = useMutation({
    mutationFn: getBehaviourInsight,
    onSuccess: (d) => setResult(d.insight || ""),
    onError: (e) => setResult(`Error: ${e.response?.data?.error || e.message}`),
  });

  return (
    <div>
      {!configured && <NotConfiguredBanner />}
      <div style={{ background: "#f0f9ff", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#0369a1" }}>
        Select a student to analyse their behaviour logs from the last 30 days and get AI-powered ABA/CBT strategy recommendations.
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Select Student</label>
          <select value={studentId} onChange={e => { setStudentId(e.target.value); setResult(""); }} style={{
            width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14,
          }}>
            <option value="">— Choose a student —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
        <button onClick={() => insightM.mutate(studentId)} disabled={!configured || !studentId || insightM.isPending} style={{
          padding: "10px 20px", borderRadius: 8, border: "none",
          background: configured && studentId ? "#6366f1" : "#e2e8f0",
          color: configured && studentId ? "#fff" : "#94a3b8",
          fontWeight: 700, fontSize: 14, cursor: configured && studentId ? "pointer" : "not-allowed",
        }}>{insightM.isPending ? "Analysing..." : "🧠 Analyse"}</button>
      </div>

      {result && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>Behaviour Analysis & Strategies</div>
            <button onClick={() => navigator.clipboard.writeText(result)} style={{
              padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0",
              background: "#fff", fontSize: 12, cursor: "pointer", color: "#475569",
            }}>📋 Copy</button>
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, color: "#334155", fontFamily: "inherit" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}

// ── Progress Report Tab ────────────────────────────────────────────────────────
function ProgressReportTab({ configured }) {
  const [studentId, setStudentId] = useState("");
  const [term, setTerm] = useState("");
  const [result, setResult] = useState("");

  const { data: stuData } = useQuery({ queryKey: ["students-all"], queryFn: () => fetchStudents({ status: "ACTIVE" }) });
  const students = stuData?.students || [];

  const reportM = useMutation({
    mutationFn: ({ id, t }) => generateProgressReport(id, t),
    onSuccess: (d) => setResult(d.report || ""),
    onError: (e) => setResult(`Error: ${e.response?.data?.error || e.message}`),
  });

  return (
    <div>
      {!configured && <NotConfiguredBanner />}
      <div style={{ background: "#f0fdf4", borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: "#166534" }}>
        Generate a warm, parent-friendly progress narrative from a student's milestone records. The report includes Islamic closing reflections and home support tips.
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: 180 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Select Student</label>
          <select value={studentId} onChange={e => { setStudentId(e.target.value); setResult(""); }} style={{
            width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14,
          }}>
            <option value="">— Choose a student —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Term (optional)</label>
          <input value={term} onChange={e => setTerm(e.target.value)} placeholder="e.g. Autumn Term 2025"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }}/>
        </div>
        <button onClick={() => reportM.mutate({ id: studentId, t: term })} disabled={!configured || !studentId || reportM.isPending} style={{
          padding: "10px 20px", borderRadius: 8, border: "none",
          background: configured && studentId ? "#10b981" : "#e2e8f0",
          color: configured && studentId ? "#fff" : "#94a3b8",
          fontWeight: 700, fontSize: 14, cursor: configured && studentId ? "pointer" : "not-allowed",
        }}>{reportM.isPending ? "Writing..." : "📄 Generate Report"}</button>
      </div>

      {result && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 15 }}>Progress Report</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(result)} style={{
                padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0",
                background: "#fff", fontSize: 12, cursor: "pointer", color: "#475569",
              }}>📋 Copy</button>
              <button onClick={() => {
                const w = window.open("", "_blank");
                w.document.write(`<pre style="font-family:sans-serif;line-height:1.8;padding:40px;max-width:700px;margin:auto">${result}</pre>`);
                w.print();
              }} style={{
                padding: "5px 12px", borderRadius: 6, border: "1px solid #10b981",
                background: "#fff", fontSize: 12, cursor: "pointer", color: "#10b981", fontWeight: 600,
              }}>🖨 Print</button>
            </div>
          </div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.8, color: "#334155", fontFamily: "inherit" }}>{result}</pre>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function DashAI() {
  const [tab, setTab] = useState("chat");

  const { data: statusData } = useQuery({
    queryKey: ["ai-status"], queryFn: fetchAIStatus,
    retry: false, staleTime: 60000,
  });
  const configured = statusData?.configured === true;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" }}>AI Intelligence Layer</h2>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Powered by OpenAI — lesson planning, behaviour insights, progress reports</p>
          </div>
          <div style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: configured ? "#dcfce7" : "#fef3c7",
            color: configured ? "#16a34a" : "#92400e",
          }}>
            {configured ? "✓ AI Active" : "⚠ API Key Needed"}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 4, marginBottom: 20, width: "fit-content" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            background: tab === t.id ? "#fff" : "transparent",
            color: tab === t.id ? "#6366f1" : "#64748b",
            fontWeight: tab === t.id ? 700 : 500, fontSize: 13,
            boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.15s",
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "chat"      && <ChatTab configured={configured} />}
        {tab === "lesson"    && <LessonPlannerTab configured={configured} />}
        {tab === "behaviour" && <BehaviourInsightTab configured={configured} />}
        {tab === "report"    && <ProgressReportTab configured={configured} />}
      </div>

      <style>{`@keyframes bounce { 0%,80%,100% { transform: translateY(0) } 40% { transform: translateY(-6px) } }`}</style>
    </div>
  );
}
