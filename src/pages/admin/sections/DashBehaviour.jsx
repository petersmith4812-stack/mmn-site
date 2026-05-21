import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import { fetchStudents } from "../../../api/students";
import { fetchBehaviour, fetchBehaviourStats, createBehaviour, updateBehaviour, deleteBehaviour } from "../../../api/behaviour";
import { checkApiHealth } from "../../../api/auth";

const CATEGORIES = {
  POSITIVE:    { label:"Positive",    icon:"✅", color:"#22C55E", bg:"#22C55E14" },
  NEUTRAL:     { label:"Neutral",     icon:"➡️",  color:"#6B6B8A", bg:"#6B6B8A12" },
  CHALLENGING: { label:"Challenging", icon:"⚠️",  color:"#F0876A", bg:"#F0876A14" },
};

const SETTINGS = {
  CLASSROOM:  "Classroom",
  PLAYGROUND: "Playground",
  LUNCH:      "Lunch",
  NAP_TIME:   "Nap Time",
  TRANSITION: "Transition",
  OTHER:      "Other",
};

const INTENSITIES = [1,2,3,4,5];
const INTENSITY_LABELS = { 1:"Minimal", 2:"Mild", 3:"Moderate", 4:"High", 5:"Intense" };
const INTENSITY_COLORS = { 1:"#22C55E", 2:"#4BAE95", 3:"#F5A623", 4:"#F0876A", 5:"#EF4444" };

const TODAY = new Date().toISOString().slice(0,10);
const EMPTY_FORM = {
  category:"POSITIVE", setting:"CLASSROOM", antecedent:"", behaviour:"",
  consequence:"", intensity:3, duration:"", notes:"", observedAt: TODAY,
};

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
    <div style={{ fontSize:64 }}>🧠</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy }}>API Server Required</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:440, lineHeight:1.7, margin:0 }}>
      Behaviour tracking requires the MMN API server. Go to the <strong>Cloud</strong> tab to connect.
    </p>
  </div>
);

export default function DashBehaviour() {
  const qc = useQueryClient();
  const [isOnline, setIsOnline]     = useState(null);
  const [stuSearch, setStuSearch]   = useState("");
  const [selectedStu, setSelectedStu] = useState(null);
  const [catFilter, setCatFilter]   = useState("all");
  const [showModal, setShowModal]   = useState(false);
  const [editRec, setEditRec]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErr, setFormErr]       = useState("");
  const [deleteId, setDeleteId]     = useState(null);

  useEffect(() => { checkApiHealth().then(h => setIsOnline(!!h)); }, []);

  const { data: stuData } = useQuery({
    queryKey: ["students-all-active"],
    queryFn: () => fetchStudents({ status:"ACTIVE", limit:500 }),
    enabled: !!isOnline,
  });
  const allStudents = stuData?.students || [];
  const students = stuSearch
    ? allStudents.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(stuSearch.toLowerCase()))
    : allStudents;

  const { data: logsData, isLoading: loadingLogs } = useQuery({
    queryKey: ["behaviour", selectedStu?.id, catFilter],
    queryFn: () => fetchBehaviour(selectedStu.id, catFilter !== "all" ? { category: catFilter } : {}),
    enabled: !!isOnline && !!selectedStu,
  });
  const logs = logsData?.data || [];

  const { data: statsData } = useQuery({
    queryKey: ["behaviour-stats", selectedStu?.id],
    queryFn: () => fetchBehaviourStats(selectedStu.id),
    enabled: !!isOnline && !!selectedStu,
  });
  const stats = statsData || { total:0, POSITIVE:0, CHALLENGING:0, NEUTRAL:0, avgIntensity: null };

  const createMut = useMutation({
    mutationFn: createBehaviour,
    onSuccess: () => { qc.invalidateQueries(["behaviour", selectedStu?.id]); qc.invalidateQueries(["behaviour-stats", selectedStu?.id]); setShowModal(false); setForm(EMPTY_FORM); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateBehaviour(id, data),
    onSuccess: () => { qc.invalidateQueries(["behaviour", selectedStu?.id]); qc.invalidateQueries(["behaviour-stats", selectedStu?.id]); setShowModal(false); setEditRec(null); setForm(EMPTY_FORM); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });
  const deleteMut = useMutation({
    mutationFn: deleteBehaviour,
    onSuccess: () => { qc.invalidateQueries(["behaviour", selectedStu?.id]); qc.invalidateQueries(["behaviour-stats", selectedStu?.id]); setDeleteId(null); },
  });

  const openAdd = () => {
    setEditRec(null);
    setForm({ ...EMPTY_FORM, observedAt: TODAY });
    setFormErr("");
    setShowModal(true);
  };
  const openEdit = (rec) => {
    setEditRec(rec);
    setForm({
      category: rec.category, setting: rec.setting || "CLASSROOM",
      antecedent: rec.antecedent || "", behaviour: rec.behaviour,
      consequence: rec.consequence || "", intensity: rec.intensity || 3,
      duration: rec.duration || "", notes: rec.notes || "",
      observedAt: rec.observed_at?.slice(0,10) || TODAY,
    });
    setFormErr("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.behaviour.trim()) { setFormErr("Behaviour description is required"); return; }
    setFormErr("");
    const payload = {
      studentId:   selectedStu.id,
      category:    form.category,
      setting:     form.setting,
      antecedent:  form.antecedent  || null,
      behaviour:   form.behaviour.trim(),
      consequence: form.consequence || null,
      intensity:   form.intensity   || null,
      duration:    form.duration    ? parseInt(form.duration) : null,
      notes:       form.notes       || null,
      observedAt:  form.observedAt ? new Date(form.observedAt + "T12:00:00").toISOString() : undefined,
    };
    if (editRec) updateMut.mutate({ id: editRec.id, data: payload });
    else         createMut.mutate(payload);
  };

  // Group logs by date
  const grouped = logs.reduce((acc, log) => {
    const d = log.observed_at?.slice(0,10) || "unknown";
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {});
  const groupedDates = Object.keys(grouped).sort((a,b) => b.localeCompare(a));

  if (isOnline === null) return <div style={{ padding:60, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Checking connection…</div>;
  if (isOnline === false) return <OfflineState />;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy, margin:0 }}>🧠 Behaviour Log</h1>
        <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, margin:"4px 0 0" }}>Track student behaviour using the Antecedent–Behaviour–Consequence model</p>
      </div>

      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
        {/* Student list */}
        <div style={{ width:220, flexShrink:0 }}>
          <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.navy}10` }}>
              <input type="text" placeholder="Search student…" value={stuSearch}
                onChange={e => setStuSearch(e.target.value)}
                style={{ ...inp, padding:"8px 12px", fontSize:13 }} />
            </div>
            <div style={{ maxHeight:520, overflowY:"auto" }}>
              {students.length === 0
                ? <div style={{ padding:20, textAlign:"center", fontFamily:"Nunito", color:C.muted, fontSize:13 }}>No students found</div>
                : students.map(s => (
                  <div key={s.id} onClick={() => { setSelectedStu(s); setCatFilter("all"); }}
                    style={{ padding:"10px 16px", cursor:"pointer", borderBottom:`1px solid ${C.navy}06`, transition:"background 0.12s",
                      background: selectedStu?.id===s.id ? `${C.navy}10` : "transparent",
                      borderLeft: selectedStu?.id===s.id ? `3px solid ${C.coral}` : "3px solid transparent",
                    }}
                    onMouseEnter={e=>{ if(selectedStu?.id!==s.id) e.currentTarget.style.background=`${C.navy}05`; }}
                    onMouseLeave={e=>{ if(selectedStu?.id!==s.id) e.currentTarget.style.background="transparent"; }}
                  >
                    <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color: selectedStu?.id===s.id ? C.navy : C.text }}>{s.first_name} {s.last_name}</div>
                    {s.classes && <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{s.classes.name}</div>}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex:1 }}>
          {!selectedStu ? (
            <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:48, textAlign:"center" }}>
              <div style={{ fontSize:56, marginBottom:16 }}>👈</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>Select a Student</div>
              <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>Choose a student to view and log their behaviour records.</div>
            </div>
          ) : (
            <>
              {/* Student header + stats */}
              <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px 24px", marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
                  <div style={{ width:48, height:48, borderRadius:"50%", background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {selectedStu.gender==="FEMALE" ? "👧" : "👦"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy }}>{selectedStu.first_name} {selectedStu.last_name}</div>
                    <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>{selectedStu.classes?.name || "No class"}</div>
                  </div>
                  <button onClick={openAdd} style={{ padding:"9px 18px", borderRadius:10, background:C.coral, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                    + Log Behaviour
                  </button>
                </div>
                {/* Stats */}
                <div style={{ display:"flex", gap:10 }}>
                  {[
                    { label:"Total", value: stats.total, color: C.navy },
                    { label:"Positive", value: stats.POSITIVE, color: "#22C55E" },
                    { label:"Neutral", value: stats.NEUTRAL, color: "#6B6B8A" },
                    { label:"Challenging", value: stats.CHALLENGING, color: "#F0876A" },
                    { label:"Avg Intensity", value: stats.avgIntensity !== null ? stats.avgIntensity : "—", color: stats.avgIntensity >= 4 ? "#EF4444" : stats.avgIntensity >= 3 ? "#F5A623" : "#22C55E" },
                  ].map(s => (
                    <div key={s.label} style={{ flex:1, background:`${s.color}08`, borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                      <div style={{ fontFamily:"Fredoka One", fontSize:20, color:s.color }}>{s.value}</div>
                      <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category filter */}
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                {["all","POSITIVE","NEUTRAL","CHALLENGING"].map(cat => {
                  const cfg = cat === "all" ? { label:"All", icon:"📋", color:C.navy } : { ...CATEGORIES[cat], color: CATEGORIES[cat].color };
                  return (
                    <button key={cat} onClick={() => setCatFilter(cat)}
                      style={{ padding:"7px 14px", borderRadius:20, cursor:"pointer", border:`1.5px solid ${catFilter===cat ? cfg.color : `${C.navy}14`}`, background: catFilter===cat ? `${cfg.color}12` : "transparent", color: catFilter===cat ? cfg.color : C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
                      {cat !== "all" && <span>{CATEGORIES[cat].icon}</span>}
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Log entries */}
              {loadingLogs ? (
                <div style={{ padding:40, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Loading records…</div>
              ) : logs.length === 0 ? (
                <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy, marginBottom:8 }}>No Records Yet</div>
                  <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginBottom:20 }}>Start logging {selectedStu.first_name}'s behaviour using the ABC model.</div>
                  <button onClick={openAdd} style={{ padding:"10px 24px", borderRadius:10, background:C.coral, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:14, cursor:"pointer" }}>Log First Behaviour</button>
                </div>
              ) : groupedDates.map(date => (
                <div key={date} style={{ marginBottom:20 }}>
                  <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, paddingLeft:4 }}>
                    {new Date(date+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </div>
                  {grouped[date].map(log => {
                    const catCfg = CATEGORIES[log.category] || CATEGORIES.NEUTRAL;
                    return (
                      <div key={log.id} style={{ background:C.white, borderRadius:14, boxShadow:"0 1px 6px rgba(0,0,0,0.06)", marginBottom:10, borderLeft:`4px solid ${catCfg.color}`, overflow:"hidden" }}>
                        <div style={{ padding:"14px 18px" }}>
                          <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                            <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{catCfg.icon}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                                <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:11, color:catCfg.color, background:catCfg.bg, padding:"2px 8px", borderRadius:100, textTransform:"uppercase", letterSpacing:"0.06em" }}>{catCfg.label}</span>
                                <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{SETTINGS[log.setting] || log.setting}</span>
                                {log.intensity && (
                                  <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:INTENSITY_COLORS[log.intensity] }}>
                                    Intensity: {log.intensity}/5 ({INTENSITY_LABELS[log.intensity]})
                                  </span>
                                )}
                                {log.duration && <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>⏱ {log.duration} min</span>}
                              </div>
                              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:C.text, marginBottom:6 }}>{log.behaviour}</div>
                              {(log.antecedent || log.consequence) && (
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, background:`${C.navy}04`, borderRadius:8, padding:"10px 12px", marginTop:6 }}>
                                  {log.antecedent && (
                                    <div>
                                      <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Antecedent</div>
                                      <div style={{ fontFamily:"Nunito", fontSize:13, color:C.text }}>{log.antecedent}</div>
                                    </div>
                                  )}
                                  {log.consequence && (
                                    <div>
                                      <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Consequence</div>
                                      <div style={{ fontFamily:"Nunito", fontSize:13, color:C.text }}>{log.consequence}</div>
                                    </div>
                                  )}
                                </div>
                              )}
                              {log.notes && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:6, fontStyle:"italic" }}>{log.notes}</div>}
                              <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginTop:6 }}>
                                {new Date(log.observed_at).toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" })}
                              </div>
                            </div>
                            <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                              <button onClick={() => openEdit(log)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>Edit</button>
                              <button onClick={() => setDeleteId(log.id)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #EF444430", background:"transparent", color:"#EF4444", fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>✕</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Log/Edit Modal */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setEditRec(null); }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:20 }}>
            {editRec ? "Edit Behaviour Log" : "Log Behaviour"}
          </div>
          <div style={{ display:"grid", gap:14 }}>
            {/* Category */}
            <div>
              <label style={lbl}>Category *</label>
              <div style={{ display:"flex", gap:8 }}>
                {Object.entries(CATEGORIES).map(([key, cfg]) => (
                  <button key={key} onClick={() => setForm(f=>({...f,category:key}))}
                    style={{ flex:1, padding:"9px 6px", borderRadius:10, cursor:"pointer", border:`1.5px solid ${form.category===key ? cfg.color : `${C.navy}15`}`, background: form.category===key ? cfg.bg : "transparent", color: form.category===key ? cfg.color : C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    <span>{cfg.icon}</span> <span>{cfg.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Setting + Date */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={lbl}>Setting</label>
                <select value={form.setting} onChange={e => setForm(f=>({...f,setting:e.target.value}))} style={inp}>
                  {Object.entries(SETTINGS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Date</label>
                <input type="date" value={form.observedAt} onChange={e => setForm(f=>({...f,observedAt:e.target.value}))} style={inp} />
              </div>
            </div>
            {/* ABC fields */}
            <div>
              <label style={lbl}>Antecedent — What happened before?</label>
              <textarea rows={2} placeholder="e.g. Asked to stop playing and join circle time" value={form.antecedent}
                onChange={e => setForm(f=>({...f,antecedent:e.target.value}))} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
            </div>
            <div>
              <label style={lbl}>Behaviour — What did the child do? *</label>
              <textarea rows={2} placeholder="e.g. Cried and refused to leave the activity" value={form.behaviour}
                onChange={e => setForm(f=>({...f,behaviour:e.target.value}))} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
            </div>
            <div>
              <label style={lbl}>Consequence — What happened after?</label>
              <textarea rows={2} placeholder="e.g. Teacher gave extra transition time, student joined after 2 min" value={form.consequence}
                onChange={e => setForm(f=>({...f,consequence:e.target.value}))} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
            </div>
            {/* Intensity + Duration */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div>
                <label style={lbl}>Intensity (1–5)</label>
                <div style={{ display:"flex", gap:6 }}>
                  {INTENSITIES.map(n => (
                    <button key={n} onClick={() => setForm(f=>({...f,intensity:n}))}
                      style={{ flex:1, padding:"7px 4px", borderRadius:8, cursor:"pointer", border:`1.5px solid ${form.intensity===n ? INTENSITY_COLORS[n] : `${C.navy}15`}`, background: form.intensity===n ? `${INTENSITY_COLORS[n]}18` : "transparent", color: form.intensity===n ? INTENSITY_COLORS[n] : C.muted, fontFamily:"Nunito", fontWeight:800, fontSize:13 }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily:"Nunito", fontSize:11, color:INTENSITY_COLORS[form.intensity], marginTop:4, textAlign:"center" }}>{INTENSITY_LABELS[form.intensity]}</div>
              </div>
              <div>
                <label style={lbl}>Duration (minutes)</label>
                <input type="number" min={1} placeholder="e.g. 5" value={form.duration}
                  onChange={e => setForm(f=>({...f,duration:e.target.value}))} style={inp} />
              </div>
            </div>
            <div>
              <label style={lbl}>Additional Notes</label>
              <textarea rows={2} placeholder="Any other observations or context…" value={form.notes}
                onChange={e => setForm(f=>({...f,notes:e.target.value}))} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
            </div>
            {formErr && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{formErr}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
              <button onClick={() => { setShowModal(false); setEditRec(null); }}
                style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Update Log" : "Save Log"}
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
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>Delete Log Entry?</div>
            <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginBottom:24 }}>This behaviour record will be permanently removed.</p>
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
