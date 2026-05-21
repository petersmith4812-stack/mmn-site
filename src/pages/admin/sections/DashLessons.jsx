import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import { fetchLessons, createLesson, updateLesson, deleteLesson } from "../../../api/lessons";
import { fetchClasses } from "../../../api/leads";
import { checkApiHealth } from "../../../api/auth";

const SUBJECTS = ["Literacy","Numeracy","Islamic Studies","Arabic","Physical Education","Art & Craft","Science","Circle Time","Outdoor Play","Other"];

const STATUS_CFG = {
  DRAFT: { label:"Draft", color:"#6B6B8A", bg:"#6B6B8A14" },
  READY: { label:"Ready", color:"#1B3F8B", bg:"#1B3F8B14" },
  DONE:  { label:"Done",  color:"#22C55E", bg:"#22C55E14" },
};

const SUBJECT_COLORS = {
  Literacy:       "#1B3F8B",
  Numeracy:       "#4BAE95",
  "Islamic Studies": "#2E7D32",
  Arabic:         "#00838F",
  "Physical Education": "#F0876A",
  "Art & Craft":  "#9B59B6",
  Science:        "#F5A623",
  "Circle Time":  "#E91E63",
  "Outdoor Play": "#22C55E",
  Other:          "#6B6B8A",
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
const EMPTY_FORM = { classId:"", date:"", subject:"Literacy", title:"", objectives:[""], activities:"", resources:"", assessment:"", status:"DRAFT" };

const getWeekStart = (d) => {
  const dt = new Date(d);
  const day = dt.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const toISO   = (d)    => d.toISOString().slice(0, 10);

const Modal = ({ onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ background:C.white, borderRadius:20, padding:32, maxWidth:560, width:"100%", maxHeight:"92vh", overflowY:"auto", position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:C.muted, lineHeight:1 }}>✕</button>
      {children}
    </div>
  </div>
);

const inp = { width:"100%", padding:"10px 14px", border:`1.5px solid ${C.navy}15`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };
const lbl = { display:"block", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" };

const OfflineState = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:20 }}>
    <div style={{ fontSize:64 }}>📚</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy }}>API Server Required</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:440, lineHeight:1.7, margin:0 }}>
      Lesson planning requires the MMN API server. Go to the <strong>Cloud</strong> tab to connect.
    </p>
  </div>
);

export default function DashLessons() {
  const qc = useQueryClient();
  const [isOnline, setIsOnline] = useState(null);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [classFilter, setClassFilter] = useState("");
  const [showModal, setShowModal]   = useState(false);
  const [editPlan, setEditPlan]     = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErr, setFormErr]       = useState("");
  const [deleteId, setDeleteId]     = useState(null);
  const [viewPlan, setViewPlan]     = useState(null);

  useEffect(() => { checkApiHealth().then(h => setIsOnline(!!h)); }, []);

  const { data: classData } = useQuery({ queryKey:["classes"], queryFn: fetchClasses, enabled: !!isOnline });
  const classes = classData || [];

  const weekEnd = addDays(weekStart, 6);
  const { data: lessonsData, isLoading } = useQuery({
    queryKey: ["lessons", toISO(weekStart), toISO(weekEnd), classFilter],
    queryFn: () => fetchLessons({ from: toISO(weekStart), to: toISO(weekEnd), classId: classFilter || undefined }),
    enabled: !!isOnline,
  });
  const lessons = lessonsData?.data || [];

  const createMut = useMutation({
    mutationFn: createLesson,
    onSuccess: () => { qc.invalidateQueries(["lessons"]); setShowModal(false); setForm(EMPTY_FORM); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateLesson(id, data),
    onSuccess: () => { qc.invalidateQueries(["lessons"]); setShowModal(false); setEditPlan(null); setForm(EMPTY_FORM); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => { qc.invalidateQueries(["lessons"]); setDeleteId(null); },
  });

  const prevWeek = () => setWeekStart(d => addDays(d, -7));
  const nextWeek = () => setWeekStart(d => addDays(d, 7));
  const goToday  = () => setWeekStart(getWeekStart(new Date()));

  const openAdd = (date) => {
    setEditPlan(null);
    setForm({ ...EMPTY_FORM, date: date ? toISO(date) : toISO(addDays(weekStart, 0)), classId: classFilter });
    setFormErr("");
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({
      classId:    plan.class_id || "",
      date:       plan.date,
      subject:    plan.subject,
      title:      plan.title,
      objectives: plan.objectives?.length ? plan.objectives : [""],
      activities: plan.activities || "",
      resources:  plan.resources  || "",
      assessment: plan.assessment || "",
      status:     plan.status,
    });
    setFormErr("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.date)  { setFormErr("Date is required");    return; }
    if (!form.title.trim()) { setFormErr("Title is required"); return; }
    setFormErr("");
    const payload = {
      classId:    form.classId  || null,
      date:       form.date,
      subject:    form.subject,
      title:      form.title.trim(),
      objectives: form.objectives.filter(o => o.trim()),
      activities: form.activities || null,
      resources:  form.resources  || null,
      assessment: form.assessment || null,
      status:     form.status,
    };
    if (editPlan) updateMut.mutate({ id: editPlan.id, data: payload });
    else          createMut.mutate(payload);
  };

  const setObjective = (i, val) => {
    setForm(f => { const o = [...f.objectives]; o[i] = val; return { ...f, objectives: o }; });
  };
  const addObjective    = () => setForm(f => ({ ...f, objectives: [...f.objectives, ""] }));
  const removeObjective = (i) => setForm(f => ({ ...f, objectives: f.objectives.filter((_, j) => j !== i) }));

  const formatRange = () => {
    const opts = { day:"numeric", month:"short" };
    return `${weekStart.toLocaleDateString("en-GB", opts)} – ${addDays(weekStart, 4).toLocaleDateString("en-GB", opts)} ${weekStart.getFullYear()}`;
  };

  const isCurrentWeek = toISO(weekStart) === toISO(getWeekStart(new Date()));

  if (isOnline === null) return <div style={{ padding:60, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Checking connection…</div>;
  if (isOnline === false) return <OfflineState />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24, display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy, margin:0 }}>📚 Lesson Planner</h1>
          <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, margin:"4px 0 0" }}>Plan and organise weekly lessons across all classes</p>
        </div>
        <button onClick={() => openAdd()} style={{ padding:"9px 20px", borderRadius:10, background:C.coral, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          + New Lesson
        </button>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button onClick={prevWeek} style={navBtn}>‹</button>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:15, color:C.navy, minWidth:220, textAlign:"center" }}>{formatRange()}</div>
          <button onClick={nextWeek} style={navBtn}>›</button>
        </div>
        {!isCurrentWeek && (
          <button onClick={goToday} style={{ padding:"7px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:12, cursor:"pointer" }}>
            Today
          </button>
        )}
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          style={{ padding:"8px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:13, outline:"none", background:C.white, color:C.text }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ flex:1 }} />
        <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>{lessons.length} lesson{lessons.length !== 1 ? "s" : ""} this week</div>
      </div>

      {/* Weekly grid */}
      {isLoading ? (
        <div style={{ padding:48, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Loading lesson plans…</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }}>
          {DAYS.map((day, di) => {
            const dayDate = addDays(weekStart, di);
            const dateStr = toISO(dayDate);
            const isToday = dateStr === toISO(new Date());
            const dayLessons = lessons.filter(l => l.date === dateStr);
            return (
              <div key={day}>
                {/* Day header */}
                <div style={{ padding:"10px 0 8px", textAlign:"center" }}>
                  <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:12, textTransform:"uppercase", letterSpacing:"0.08em", color: isToday ? C.coral : C.muted }}>{day.slice(0,3)}</div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:22, color: isToday ? C.coral : C.navy, lineHeight:1 }}>{dayDate.getDate()}</div>
                </div>
                {/* Day column */}
                <div style={{ minHeight:300, background: isToday ? `${C.coral}05` : `${C.navy}03`, borderRadius:14, padding:8, border:`1.5px solid ${isToday ? C.coral+"30" : C.navy+"10"}` }}>
                  {dayLessons.map(plan => {
                    const subjColor = SUBJECT_COLORS[plan.subject] || "#6B6B8A";
                    const stCfg = STATUS_CFG[plan.status] || STATUS_CFG.DRAFT;
                    const cls = plan.classes;
                    return (
                      <div key={plan.id} style={{ background:C.white, borderRadius:10, padding:"10px 12px", marginBottom:8, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.07)", borderLeft:`3px solid ${subjColor}`, transition:"box-shadow 0.15s" }}
                        onClick={() => setViewPlan(plan)}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,0.12)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"}
                      >
                        <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:10, color:subjColor, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{plan.subject}</div>
                        <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.text, lineHeight:1.35, marginBottom:4 }}>{plan.title}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                          <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:stCfg.color, background:stCfg.bg, padding:"1px 7px", borderRadius:100 }}>{stCfg.label}</span>
                          {cls && <span style={{ fontFamily:"Nunito", fontSize:10, color:cls.color||C.muted, fontWeight:700 }}>{cls.name}</span>}
                        </div>
                      </div>
                    );
                  })}
                  <button onClick={() => openAdd(dayDate)}
                    style={{ width:"100%", padding:"7px", borderRadius:10, border:`1.5px dashed ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontSize:11, cursor:"pointer", marginTop: dayLessons.length ? 4 : 0 }}>
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List of all this-week's lessons below the grid */}
      {lessons.length > 0 && (
        <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginTop:24, overflow:"hidden" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.navy}10`, fontFamily:"Fredoka One", fontSize:16, color:C.navy }}>
            This Week's Lessons
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:`${C.navy}06`, borderBottom:`1px solid ${C.navy}10` }}>
                {["Date","Subject","Title","Class","Status",""].map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.navy, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lessons.map((plan, i) => {
                const stCfg = STATUS_CFG[plan.status] || STATUS_CFG.DRAFT;
                const subjColor = SUBJECT_COLORS[plan.subject] || "#6B6B8A";
                return (
                  <tr key={plan.id} style={{ borderBottom:`1px solid ${C.navy}07`, background: i%2===0 ? "transparent" : `${C.navy}02` }}>
                    <td style={{ padding:"10px 16px", fontFamily:"Nunito", fontSize:13, color:C.muted }}>
                      {new Date(plan.date + "T00:00:00").toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })}
                    </td>
                    <td style={{ padding:"10px 16px" }}>
                      <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:subjColor }}>{plan.subject}</span>
                    </td>
                    <td style={{ padding:"10px 16px", fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>{plan.title}</td>
                    <td style={{ padding:"10px 16px", fontFamily:"Nunito", fontSize:13, color:C.muted }}>{plan.classes?.name || "—"}</td>
                    <td style={{ padding:"10px 16px" }}>
                      <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:stCfg.color, background:stCfg.bg, padding:"3px 9px", borderRadius:100 }}>{stCfg.label}</span>
                    </td>
                    <td style={{ padding:"10px 16px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => openEdit(plan)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>Edit</button>
                        <button onClick={() => setDeleteId(plan.id)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #EF444430", background:"transparent", color:"#EF4444", fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View detail modal */}
      {viewPlan && (
        <Modal onClose={() => setViewPlan(null)}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:11, color:SUBJECT_COLORS[viewPlan.subject]||C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{viewPlan.subject}</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:24, color:C.navy, marginBottom:6 }}>{viewPlan.title}</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:STATUS_CFG[viewPlan.status]?.color, background:STATUS_CFG[viewPlan.status]?.bg, padding:"3px 9px", borderRadius:100 }}>{STATUS_CFG[viewPlan.status]?.label}</span>
              {viewPlan.classes && <span style={{ fontFamily:"Nunito", fontSize:11, color:viewPlan.classes.color||C.muted, fontWeight:700 }}>📍 {viewPlan.classes.name}</span>}
              <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>{new Date(viewPlan.date+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</span>
            </div>
          </div>
          {viewPlan.objectives?.filter(o=>o).length > 0 && (
            <Section title="Learning Objectives">
              <ul style={{ margin:0, paddingLeft:20 }}>
                {viewPlan.objectives.filter(o=>o).map((o,i) => <li key={i} style={{ fontFamily:"Nunito", fontSize:14, color:C.text, marginBottom:4 }}>{o}</li>)}
              </ul>
            </Section>
          )}
          {viewPlan.activities && <Section title="Activities"><div style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.6, whiteSpace:"pre-wrap" }}>{viewPlan.activities}</div></Section>}
          {viewPlan.resources  && <Section title="Resources"><div style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.6 }}>{viewPlan.resources}</div></Section>}
          {viewPlan.assessment && <Section title="Assessment"><div style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.6 }}>{viewPlan.assessment}</div></Section>}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:16, borderTop:`1px solid ${C.navy}10`, marginTop:16 }}>
            <button onClick={() => { setViewPlan(null); openEdit(viewPlan); }} style={{ padding:"9px 18px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Edit</button>
            <button onClick={() => setViewPlan(null)} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:C.navy, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Close</button>
          </div>
        </Modal>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setEditPlan(null); }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:20 }}>
            {editPlan ? "Edit Lesson Plan" : "New Lesson Plan"}
          </div>
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={lbl}>Date *</label>
                <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Class</label>
                <select value={form.classId} onChange={e => setForm(f=>({...f,classId:e.target.value}))} style={inp}>
                  <option value="">All / General</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={lbl}>Subject *</label>
                <select value={form.subject} onChange={e => setForm(f=>({...f,subject:e.target.value}))} style={inp}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))} style={inp}>
                  {Object.entries(STATUS_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Lesson Title *</label>
              <input type="text" placeholder="e.g. Introduction to letter A" value={form.title}
                onChange={e => setForm(f=>({...f,title:e.target.value}))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Learning Objectives</label>
              {form.objectives.map((obj, i) => (
                <div key={i} style={{ display:"flex", gap:6, marginBottom:6 }}>
                  <input type="text" placeholder={`Objective ${i+1}`} value={obj}
                    onChange={e => setObjective(i, e.target.value)} style={inp} />
                  {form.objectives.length > 1 && (
                    <button onClick={() => removeObjective(i)} style={{ padding:"0 10px", borderRadius:8, border:"1px solid #EF444430", background:"transparent", color:"#EF4444", cursor:"pointer", flexShrink:0 }}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={addObjective} style={{ fontFamily:"Nunito", fontSize:12, color:C.navy, background:"transparent", border:`1.5px dashed ${C.navy}30`, padding:"5px 14px", borderRadius:8, cursor:"pointer" }}>+ Add Objective</button>
            </div>
            <div>
              <label style={lbl}>Activities</label>
              <textarea rows={3} placeholder="What will students do? Materials, methods, sequence…" value={form.activities}
                onChange={e => setForm(f=>({...f,activities:e.target.value}))} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={lbl}>Resources</label>
                <textarea rows={2} placeholder="Books, printables, equipment…" value={form.resources}
                  onChange={e => setForm(f=>({...f,resources:e.target.value}))} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
              </div>
              <div>
                <label style={lbl}>Assessment</label>
                <textarea rows={2} placeholder="How will learning be observed?" value={form.assessment}
                  onChange={e => setForm(f=>({...f,assessment:e.target.value}))} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
              </div>
            </div>
            {formErr && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{formErr}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
              <button onClick={() => { setShowModal(false); setEditPlan(null); }}
                style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {createMut.isPending || updateMut.isPending ? "Saving…" : editPlan ? "Update Lesson" : "Create Lesson"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🗑️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>Delete Lesson Plan?</div>
            <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginBottom:24 }}>This lesson plan will be permanently removed.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setDeleteId(null)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#EF4444", color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {deleteMut.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const navBtn = { padding:"6px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:800, fontSize:18, cursor:"pointer", lineHeight:1 };

const Section = ({ title, children }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{title}</div>
    {children}
  </div>
);
