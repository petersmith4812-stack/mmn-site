import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import { fetchStudents } from "../../../api/students";
import { fetchNutrition, logMeal, updateMeal, deleteMeal } from "../../../api/nutrition";
import { fetchClasses } from "../../../api/leads";
import { checkApiHealth } from "../../../api/auth";

const MEALS = [
  { key:"BREAKFAST",       label:"Breakfast",        icon:"🌅", time:"7:30–8:30 am" },
  { key:"MORNING_SNACK",   label:"Morning Snack",     icon:"🍎", time:"10:00–10:30 am" },
  { key:"LUNCH",           label:"Lunch",             icon:"🌞", time:"12:30–1:00 pm" },
  { key:"AFTERNOON_SNACK", label:"Afternoon Snack",   icon:"🥪", time:"3:00–3:30 pm" },
];

const PORTIONS = [
  { key:"ALL",    label:"All",    color:"#22C55E", desc:"Finished everything" },
  { key:"MOST",   label:"Most",   color:"#4BAE95", desc:"Ate most of it" },
  { key:"HALF",   label:"Half",   color:"#F5A623", desc:"Ate about half" },
  { key:"LITTLE", label:"Little", color:"#F0876A", desc:"Only a little" },
  { key:"NONE",   label:"None",   color:"#EF4444", desc:"Didn't eat" },
];

const PORTION_COLOR = PORTIONS.reduce((a, p) => { a[p.key] = p.color; return a; }, {});
const TODAY = new Date().toISOString().slice(0,10);

const Modal = ({ onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ background:C.white, borderRadius:20, padding:32, maxWidth:500, width:"100%", maxHeight:"92vh", overflowY:"auto", position:"relative", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
      <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"transparent", border:"none", fontSize:20, cursor:"pointer", color:C.muted, lineHeight:1 }}>✕</button>
      {children}
    </div>
  </div>
);

const inp = { width:"100%", padding:"10px 14px", border:`1.5px solid ${C.navy}15`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };
const lbl = { display:"block", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.06em" };

const OfflineState = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:20 }}>
    <div style={{ fontSize:64 }}>🥗</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy }}>API Server Required</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:440, lineHeight:1.7, margin:0 }}>
      Nutrition logging requires the MMN API server. Go to the <strong>Cloud</strong> tab to connect.
    </p>
  </div>
);

export default function DashNutrition() {
  const qc = useQueryClient();
  const [isOnline, setIsOnline]       = useState(null);
  const [date, setDate]               = useState(TODAY);
  const [stuSearch, setStuSearch]     = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selectedStu, setSelectedStu] = useState(null);
  const [showModal, setShowModal]     = useState(false);
  const [modalMeal, setModalMeal]     = useState(null);
  const [editId, setEditId]           = useState(null);
  const [foodInput, setFoodInput]     = useState("");
  const [items, setItems]             = useState([]);
  const [portion, setPortion]         = useState("MOST");
  const [notes, setNotes]             = useState("");
  const [formErr, setFormErr]         = useState("");
  const [deleteItem, setDeleteItem]   = useState(null);

  useEffect(() => { checkApiHealth().then(h => setIsOnline(!!h)); }, []);

  const { data: classData } = useQuery({ queryKey:["classes"], queryFn: fetchClasses, enabled: !!isOnline });
  const classes = classData || [];

  const { data: stuData } = useQuery({
    queryKey: ["students-nutrition", classFilter],
    queryFn: () => fetchStudents({ status:"ACTIVE", limit:500, classId: classFilter || undefined }),
    enabled: !!isOnline,
  });
  const allStudents = stuData?.students || [];
  const students = stuSearch
    ? allStudents.filter(s => `${s.first_name} ${s.last_name}`.toLowerCase().includes(stuSearch.toLowerCase()))
    : allStudents;

  const { data: nutData } = useQuery({
    queryKey: ["nutrition", selectedStu?.id, date],
    queryFn: () => fetchNutrition({ studentId: selectedStu.id, date }),
    enabled: !!isOnline && !!selectedStu,
  });
  const mealLogs = nutData?.data || [];
  const mealMap = mealLogs.reduce((a, m) => { a[m.meal] = m; return a; }, {});

  const saveMut = useMutation({
    mutationFn: (data) => logMeal(data),
    onSuccess: () => { qc.invalidateQueries(["nutrition", selectedStu?.id, date]); setShowModal(false); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updateMeal(id, data),
    onSuccess: () => { qc.invalidateQueries(["nutrition", selectedStu?.id, date]); setShowModal(false); },
    onError: (e) => setFormErr(e.response?.data?.error || e.message),
  });
  const deleteMut = useMutation({
    mutationFn: deleteMeal,
    onSuccess: () => { qc.invalidateQueries(["nutrition", selectedStu?.id, date]); setDeleteItem(null); },
  });

  const openMealModal = (mealKey, existingLog) => {
    setModalMeal(mealKey);
    setEditId(existingLog?.id || null);
    setItems(existingLog?.items || []);
    setPortion(existingLog?.portion_eaten || "MOST");
    setNotes(existingLog?.notes || "");
    setFoodInput("");
    setFormErr("");
    setShowModal(true);
  };

  const addItem = () => {
    const t = foodInput.trim();
    if (!t) return;
    setItems(prev => [...prev, t]);
    setFoodInput("");
  };

  const removeItem = (i) => setItems(prev => prev.filter((_, j) => j !== i));

  const handleSave = () => {
    if (!items.length) { setFormErr("Add at least one food item"); return; }
    setFormErr("");
    const payload = { studentId: selectedStu.id, date, meal: modalMeal, items, portionEaten: portion, notes: notes || null };
    if (editId) updateMut.mutate({ id: editId, data: { items, portionEaten: portion, notes: notes || null } });
    else        saveMut.mutate(payload);
  };

  const portionColor = (p) => PORTION_COLOR[p] || C.muted;

  // Summary stats
  const loggedCount = mealLogs.length;
  const avgPortionScore = mealLogs.length
    ? mealLogs.reduce((s, m) => {
        const idx = PORTIONS.findIndex(p => p.key === m.portion_eaten);
        return s + (idx >= 0 ? (4 - idx) : 2);
      }, 0) / mealLogs.length
    : null;

  if (isOnline === null) return <div style={{ padding:60, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Checking connection…</div>;
  if (isOnline === false) return <OfflineState />;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy, margin:0 }}>🥗 Nutrition Log</h1>
        <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, margin:"4px 0 0" }}>Track daily meal intake and eating habits for each student</p>
      </div>

      {/* Top controls */}
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:20, flexWrap:"wrap" }}>
        <input type="date" value={date} onChange={e => { setDate(e.target.value); }}
          style={{ padding:"9px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:14, outline:"none", color:C.text }} />
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          style={{ padding:"9px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:13, outline:"none", background:C.white, color:C.text }}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
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
                  <div key={s.id} onClick={() => setSelectedStu(s)}
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
              <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>Choose a student to view and log their meals.</div>
            </div>
          ) : (
            <>
              {/* Student header */}
              <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px 24px", marginBottom:16, display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                  {selectedStu.gender==="FEMALE" ? "👧" : "👦"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy }}>{selectedStu.first_name} {selectedStu.last_name}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>
                    {selectedStu.classes?.name || "No class"} ·{" "}
                    {new Date(date+"T00:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </div>
                </div>
                {/* Day summary */}
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:22, color: avgPortionScore === null ? C.muted : avgPortionScore >= 3 ? "#22C55E" : avgPortionScore >= 2 ? "#F5A623" : "#EF4444" }}>
                    {loggedCount}/4
                  </div>
                  <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>meals logged</div>
                </div>
              </div>

              {/* Meal cards grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                {MEALS.map(meal => {
                  const log = mealMap[meal.key];
                  return (
                    <div key={meal.key} style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
                      {/* Meal header */}
                      <div style={{ padding:"12px 18px", background:`${C.navy}04`, borderBottom:`1px solid ${C.navy}10`, display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:22 }}>{meal.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:"Fredoka One", fontSize:16, color:C.navy }}>{meal.label}</div>
                          <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{meal.time}</div>
                        </div>
                        {log ? (
                          <div style={{ display:"flex", gap:6 }}>
                            <button onClick={() => openMealModal(meal.key, log)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>Edit</button>
                            <button onClick={() => setDeleteItem(log.id)} style={{ padding:"5px 10px", borderRadius:8, border:"1px solid #EF444430", background:"transparent", color:"#EF4444", fontFamily:"Nunito", fontWeight:700, fontSize:11, cursor:"pointer" }}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => openMealModal(meal.key, null)}
                            style={{ padding:"6px 14px", borderRadius:8, background:`${C.coral}14`, color:C.coral, border:`1px solid ${C.coral}30`, fontFamily:"Nunito", fontWeight:700, fontSize:12, cursor:"pointer" }}>
                            + Log
                          </button>
                        )}
                      </div>
                      {/* Meal content */}
                      <div style={{ padding:"14px 18px" }}>
                        {log ? (
                          <>
                            {log.items?.length > 0 && (
                              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
                                {log.items.map((item, i) => (
                                  <span key={i} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, background:`${C.navy}10`, padding:"3px 10px", borderRadius:100 }}>{item}</span>
                                ))}
                              </div>
                            )}
                            {log.portion_eaten && (
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>Portion eaten:</span>
                                <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:portionColor(log.portion_eaten), background:`${portionColor(log.portion_eaten)}14`, padding:"2px 10px", borderRadius:100 }}>
                                  {PORTIONS.find(p=>p.key===log.portion_eaten)?.label || log.portion_eaten}
                                </span>
                              </div>
                            )}
                            {log.notes && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:6, fontStyle:"italic" }}>{log.notes}</div>}
                          </>
                        ) : (
                          <div style={{ textAlign:"center", padding:"12px 0" }}>
                            <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>Not yet logged</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Allergies reminder */}
              {selectedStu.allergies?.length > 0 && (
                <div style={{ background:"#FFF3E0", borderRadius:12, padding:"12px 18px", marginTop:16, border:"1px solid #F5A62330" }}>
                  <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:"#E65100" }}>⚠️ Allergies: </span>
                  <span style={{ fontFamily:"Nunito", fontSize:13, color:"#E65100" }}>{selectedStu.allergies.join(", ")}</span>
                </div>
              )}
              {selectedStu.medical_notes && (
                <div style={{ background:"#E3F2FD", borderRadius:12, padding:"12px 18px", marginTop:10, border:"1px solid #1B3F8B20" }}>
                  <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy }}>📋 Medical Notes: </span>
                  <span style={{ fontFamily:"Nunito", fontSize:13, color:C.navy }}>{selectedStu.medical_notes}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Meal log modal */}
      {showModal && modalMeal && (
        <Modal onClose={() => setShowModal(false)}>
          <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:6 }}>
            {editId ? "Edit" : "Log"} {MEALS.find(m=>m.key===modalMeal)?.label}
          </div>
          <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>
            {selectedStu.first_name} {selectedStu.last_name} · {new Date(date+"T00:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long"})}
          </div>
          <div style={{ display:"grid", gap:14 }}>
            {/* Food items */}
            <div>
              <label style={lbl}>Food Items *</label>
              <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                <input type="text" placeholder="Type a food item and press Enter" value={foodInput}
                  onChange={e => setFoodInput(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter") { e.preventDefault(); addItem(); } }}
                  style={{ ...inp, flex:1 }} />
                <button onClick={addItem} style={{ padding:"0 16px", borderRadius:10, background:C.navy, color:C.white, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer", flexShrink:0 }}>Add</button>
              </div>
              {items.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {items.map((item, i) => (
                    <span key={i} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, background:`${C.navy}10`, padding:"4px 10px", borderRadius:100, display:"flex", alignItems:"center", gap:5 }}>
                      {item}
                      <button onClick={() => removeItem(i)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:13, lineHeight:1, padding:0 }}>✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* Portion */}
            <div>
              <label style={lbl}>Portion Eaten *</label>
              <div style={{ display:"flex", gap:6 }}>
                {PORTIONS.map(p => (
                  <button key={p.key} onClick={() => setPortion(p.key)} title={p.desc}
                    style={{ flex:1, padding:"8px 4px", borderRadius:10, cursor:"pointer", border:`1.5px solid ${portion===p.key ? p.color : `${C.navy}15`}`, background: portion===p.key ? `${p.color}15` : "transparent", color: portion===p.key ? p.color : C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:11 }}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily:"Nunito", fontSize:11, color:portionColor(portion), marginTop:4, textAlign:"center" }}>
                {PORTIONS.find(p=>p.key===portion)?.desc}
              </div>
            </div>
            {/* Notes */}
            <div>
              <label style={lbl}>Notes</label>
              <textarea rows={2} placeholder="Any observations about appetite, mood, allergic reactions…" value={notes}
                onChange={e => setNotes(e.target.value)} style={{ ...inp, resize:"vertical", lineHeight:1.5 }} />
            </div>
            {formErr && <div style={{ fontFamily:"Nunito", fontSize:13, color:"#EF4444", fontWeight:700 }}>{formErr}</div>}
            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:4 }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={handleSave} disabled={saveMut.isPending || updateMut.isPending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:C.coral, color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {saveMut.isPending || updateMut.isPending ? "Saving…" : editId ? "Update Meal" : "Log Meal"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteItem && (
        <Modal onClose={() => setDeleteItem(null)}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🗑️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>Remove Meal Log?</div>
            <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginBottom:24 }}>This meal record will be permanently removed.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setDeleteItem(null)} style={{ padding:"10px 20px", borderRadius:10, border:`1px solid ${C.navy}20`, background:"transparent", color:C.muted, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={() => deleteMut.mutate(deleteItem)} disabled={deleteMut.isPending}
                style={{ padding:"10px 24px", borderRadius:10, border:"none", background:"#EF4444", color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:13, cursor:"pointer" }}>
                {deleteMut.isPending ? "Deleting…" : "Remove"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
