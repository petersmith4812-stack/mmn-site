import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import { fetchStudents } from "../../../api/students";
import { fetchProgress, createProgress, updateProgress, deleteProgress } from "../../../api/progress";
import { checkApiHealth } from "../../../api/auth";

const DOMAINS = [
  { key:"Language & Literacy",      icon:"📖", color:"#1B3F8B" },
  { key:"Mathematics",              icon:"🔢", color:"#4BAE95" },
  { key:"Physical Development",     icon:"🏃", color:"#F0876A" },
  { key:"Social-Emotional",         icon:"❤️",  color:"#E91E63" },
  { key:"Creative Arts",            icon:"🎨", color:"#9B59B6" },
  { key:"Islamic Studies",          icon:"☪️",  color:"#2E7D32" },
  { key:"Arabic",                   icon:"🌙", color:"#00838F" },
  { key:"Understanding of the World", icon:"🌍", color:"#5D4037" },
];

const LEVELS = [
  { key:"EMERGING",   label:"Emerging",   color:"#F5A623", tip:"Beginning to show this skill" },
  { key:"DEVELOPING", label:"Developing", color:"#1B3F8B", tip:"Working towards with support" },
  { key:"SECURE",     label:"Secure",     color:"#4BAE95", tip:"Demonstrates consistently" },
  { key:"MASTERED",   label:"Mastered",   color:"#22C55E", tip:"Transfers to new contexts" },
];

const EMPTY_FORM = { domain: DOMAINS[0].key, objective:"", level:"DEVELOPING", notes:"", observedAt:"" };

const LevelBadge = ({ level }) => {
  const cfg = LEVELS.find(l => l.key === level) || LEVELS[1];
  return (
    <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", background:`${cfg.color}18`, color:cfg.color, padding:"3px 9px", borderRadius:100 }}>
      {cfg.label}
    </span>
  );
};

const Modal = ({ onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ background:C.white, borderRadius:20, padding:32, maxWidth:520, width:"100%", maxHeight:"90vh", overflowY:"auto", position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:C.muted, lineHeight:1 }}>✕</button>
      {children}
    </div>
  </div>
);

const inp = { width:"100%", padding:"10px 14px", border:`1.5px solid ${C.navy}15`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };

const OfflineState = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:20 }}>
    <div style={{ fontSize:64 }}>📊</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy }}>API Server Required</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:440, lineHeight:1.7, margin:0 }}>
      Progress tracking requires the MMN API server. Go to the <strong>Cloud</strong> tab to connect.
    </p>
  </div>
);

export default function DashProgress() {
  const qc = useQueryClient();
  const [isOnline, setIsOnline]     = useState(null);
  const [search, setSearch]         = useState("");
  const [selectedStu, setSelectedStu] = useState(null);
  const [domainFilter, setDomainFilter] = useState("all");
  const [showModal, setShowModal]   = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErr, setFormErr]       = useState("");
  const [deleteId, setDeleteId]     = useState(null);

  useEffect(() => { checkApiHealth().then(h => setIsOnline(!!h)); }, []);

  const { data: stuData, isLoading: loadingStu } = useQuery({
    queryKey: ["students-all"],
    queryFn: () => fetchStudents({ limit: 500, status: "ACTIVE" }),
    enabled: !!isOnline,
  });
  const allStudents = stuData?.students || [];
  const students = search
    ? allStudents.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()))
    : allStudents;

  const { data: progData, isLoading: loadingProg } = useQuery({
    queryKey: ["progress", selectedStu?.id],
    queryFn: () => fetchProgress(selectedStu.id),
    enabled: !!isOnline && !!selectedStu,
  });
  const allRecords = progData?.data || [];

  const createMut = useMutation({
    mutationFn: createProgress,
    onSuccess: () => { qc.invalidateQueries(["progress", selectedStu?.id]); setShowModal(false); setForm(EMPTY_FORM); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateProgress(id, data),
    onSuccess: () => { qc.invalidateQueries(["progress", selectedStu?.id]); setShowModal(false); setEditRecord(null); setForm(EMPTY_FORM); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteProgress,
    onSuccess: () => { qc.invalidateQueries(["progress", selectedStu?.id]); setDeleteId(null); },
  });

  const openAdd = () => {
    setEditRecord(null);
    setForm({ ...EMPTY_FORM, observedAt: new Date().toISOString().slice(0, 10) });
    setFormErr("");
    setShowModal(true);
  };

  const openEdit = (rec) => {
    setEditRecord(rec);
    setForm({
      domain: rec.domain, objective: rec.objective, level: rec.level,
      notes: rec.notes || "", observedAt: rec.observed_at?.slice(0, 10) || "",
    });
    setFormErr("");
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.objective.trim()) { setFormErr("Objective is required"); return; }
    setFormErr("");
    const payload = {
      studentId:   selectedStu.id,
      domain:      form.domain,
      objective:   form.objective.trim(),
      level:       form.level,
      notes:       form.notes || null,
      observedAt:  form.observedAt ? new Date(form.observedAt + "T12:00:00").toISOString() : undefined,
    };
    if (editRecord) updateMut.mutate({ id: editRecord.id, data: payload });
    else            createMut.mutate(payload);
  };

  const grouped = DOMAINS.map(d => ({
    ...d,
    recs: allRecords.filter(r => r.domain === d.key),
  })).filter(d => domainFilter === "all" || d.key === domainFilter);

  if (isOnline === null) return <div style={{ padding:60, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Checking connection…</div>;
  if (isOnline === false) return <OfflineState />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy, margin:0 }}>📊 Progress Tracker</h1>
        <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, margin:"4px 0 0" }}>Track developmental milestones across all learning domains</p>
      </div>

      <div style={{ display:"flex", gap:20, alignItems:"flex-start" }}>
        {/* Left: student list */}
        <div style={{ width:220, flexShrink:0 }}>
          <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.navy}10` }}>
              <input
                type="text" placeholder="Search student…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inp, padding:"8px 12px", fontSize:13 }}
              />
            </div>
            <div style={{ maxHeight:520, overflowY:"auto" }}>
              {loadingStu ? (
                <div style={{ padding:20, textAlign:"center", fontFamily:"Nunito", color:C.muted, fontSize:13 }}>Loading…</div>
              ) : students.length === 0 ? (
                <div style={{ padding:20, textAlign:"center", fontFamily:"Nunito", color:C.muted, fontSize:13 }}>No students found</div>
              ) : students.map(s => (
                <div key={s.id} onClick={() => { setSelectedStu(s); setDomainFilter("all"); }}
                  style={{ padding:"10px 16px", cursor:"pointer", borderBottom:`1px solid ${C.navy}06`, transition:"background 0.12s",
                    background: selectedStu?.id === s.id ? `${C.navy}10` : "transparent",
                    borderLeft: selectedStu?.id === s.id ? `3px solid ${C.coral}` : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (selectedStu?.id !== s.id) e.currentTarget.style.background = `${C.navy}05`; }}
                  onMouseLeave={e => { if (selectedStu?.id !== s.id) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color: selectedStu?.id===s.id ? C.navy : C.text }}>{s.first_name} {s.last_name}</div>
                  {s.classes && <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{s.classes.name}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: progress records */}
        <div style={{ flex:1 }}>
          {!selectedStu ? (
            <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:48, textAlign:"center" }}>
              <div style={{ fontSize:56, marginBottom:16 }}>👈</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>Select a Student</div>
              <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>Choose a student from the left panel to view and add progress records.</div>
            </div>
          ) : (
            <>
              {/* Student header */}
              <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {selectedStu.gender === "FEMALE" ? "👧" : "👦"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy }}>{selectedStu.first_name} {selectedStu.last_name}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>
                    {selectedStu.classes?.name || "No class"} · {allRecords.length} milestone{allRecords.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <button onClick={openAdd} style={{ padding:"9px 18px", borderRadius:10, background:C.coral, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  + Add Record
                </button>
              </div>

              {/* Domain filter tabs */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                <DomainTab label="All Domains" icon="📚" active={domainFilter==="all"} onClick={() => setDomainFilter("all")} color={C.navy} />
                {DOMAINS.map(d => (
                  <DomainTab key={d.key} label={d.key} icon={d.icon} active={domainFilter===d.key} onClick={() => setDomainFilter(d.key)} color={d.color}
                    count={allRecords.filter(r => r.domain === d.key).length}
                  />
                ))}
              </div>

              {/* Records by domain */}
              {loadingProg ? (
                <div style={{ padding:40, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Loading records…</div>
              ) : allRecords.length === 0 ? (
                <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:48, textAlign:"center" }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy, marginBottom:8 }}>No Records Yet</div>
                  <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginBottom:20 }}>Start tracking {selectedStu.first_name}'s developmental milestones.</div>
                  <button onClick={openAdd} style={{ padding:"10px 24px", borderRadius:10, background:C.coral, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:14, cursor:"pointer" }}>Add First Record</button>
                </div>
              ) : grouped.map(d => {
                if (!d.recs.length) return null;
                return (
                  <div key={d.key} style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:16, overflow:"hidden" }}>
                    {/* Domain header */}
                    <div style={{ padding:"14px 20px", background:`${d.color}0C`, borderBottom:`1px solid ${d.color}20`, display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:18 }}>{d.icon}</span>
                      <span style={{ fontFamily:"Fredoka One", fontSize:16, color:d.color }}>{d.key}</span>
                      <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:d.color, background:`${d.color}18`, padding:"2px 8px", borderRadius:100, marginLeft:"auto" }}>{d.recs.length}</span>
                    </div>
                    {/* Level progress bar */}
                    <div style={{ padding:"10px 20px 8px", display:"flex", gap:8 }}>
                      {LEVELS.map(lv => {
                        const n = d.recs.filter(r => r.level === lv.key).length;
                        return n > 0 ? (
                          <span key={lv.key} style={{ fontFamily:"Nunito", fontSize:11, fontWeight:700, color:lv.color, background:`${lv.color}14`, padding:"2px 8px", borderRadius:100 }}>
                            {lv.label}: {n}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {/* Records */}
                    {d.recs.map((rec, i) => (
                      <div key={rec.id} style={{ padding:"12px 20px", borderTop: i>0 ? `1px solid ${C.navy}06` : `1px solid ${d.color}10`, display:"flex", alignItems:"flex-start", gap:14 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                            <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:C.text }}>{rec.objective}</span>
                            <LevelBadge level={rec.level} />
                          </div>
                          {rec.notes && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:4 }}>{rec.notes}</div>}
                          <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginTop:4 }}>
                            {new Date(rec.observed_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                          <button onClick={() => openEdit(rec)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>Edit</button>
                          <button onClick={() => setDeleteId(rec.id)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #EF444430", background:"transparent", color:"#EF4444", fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setEditRecord(null); }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:20 }}>
            {editRecord ? "Edit" : "Add"} Progress Record
          </div>
          <div style={{ display:"grid", gap:14 }}>
            <div>
              <label style={lbl}>Domain</label>
              <select value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} style={inp}>
                {DOMAINS.map(d => <option key={d.key} value={d.key}>{d.icon} {d.key}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Objective / Milestone *</label>
              <input type="text" placeholder="e.g. Can write own name" value={form.objective}
                onChange={e => setForm(f => ({ ...f, objective: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Level *</label>
              <div style={{ display:"flex", gap:8 }}>
                {LEVELS.map(lv => (
                  <button key={lv.key} onClick={() => setForm(f => ({ ...f, level: lv.key }))} title={lv.tip}
                    style={{ flex:1, padding:"8px 6px", borderRadius:10, cursor:"pointer", transition:"all 0.12s",
                      border:`1.5px solid ${form.level===lv.key ? lv.color : `${C.navy}15`}`,
                      background: form.level===lv.key ? `${lv.color}15` : "transparent",
                      color: form.level===lv.key ? lv.color : C.muted,
                      fontFamily:"Nunito", fontWeight:700, fontSize:11,
                    }}>{lv.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Date Observed</label>
              <input type="date" value={form.observedAt}
                onChange={e => setForm(f => ({ ...f, observedAt: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Notes</label>
              <textarea rows={3} placeholder="Observations, context, next steps…" value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
            </div>
            {formErr && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{formErr}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
              <button onClick={() => { setShowModal(false); setEditRecord(null); }}
                style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {createMut.isPending || updateMut.isPending ? "Saving…" : editRecord ? "Update Record" : "Add Record"}
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
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>Delete Record?</div>
            <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginBottom:24 }}>This progress record will be permanently removed.</p>
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

const lbl = { display:"block", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" };

const DomainTab = ({ label, icon, active, onClick, color, count }) => (
  <button onClick={onClick}
    style={{ padding:"6px 12px", borderRadius:20, cursor:"pointer", transition:"all 0.12s", border:`1.5px solid ${active ? color : `${C.navy}14`}`, background: active ? `${color}12` : "transparent", color: active ? color : C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:12, display:"flex", alignItems:"center", gap:5 }}>
    <span>{icon}</span>
    <span>{label.split(" ")[0]}</span>
    {count > 0 && <span style={{ background:`${color}18`, color, borderRadius:100, padding:"0 6px", fontSize:10 }}>{count}</span>}
  </button>
);
