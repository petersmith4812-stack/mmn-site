import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { C } from "../../../constants/theme";
import { fetchAttendance, bulkSaveAttendance } from "../../../api/attendance";
import { fetchStudents } from "../../../api/students";
import { fetchClasses } from "../../../api/leads";
import { checkApiHealth } from "../../../api/auth";

const STATUS_CFG = {
  PRESENT:  { label:"Present",  short:"P", color:"#22C55E", bg:"#22C55E22" },
  ABSENT:   { label:"Absent",   short:"A", color:"#EF4444", bg:"#EF444422" },
  LATE:     { label:"Late",     short:"L", color:"#F5A623", bg:"#F5A62322" },
  EXCUSED:  { label:"Excused",  short:"E", color:"#6C63FF", bg:"#6C63FF22" },
  HALF_DAY: { label:"Half Day", short:"H", color:"#0EA5E9", bg:"#0EA5E922" },
};

const TODAY = new Date().toISOString().slice(0, 10);

const OfflineState = () => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:400, gap:20 }}>
    <div style={{ fontSize:64 }}>📋</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy, textAlign:"center" }}>API Server Required</div>
    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, textAlign:"center", maxWidth:460, lineHeight:1.7, margin:0 }}>
      Attendance tracking requires the MMN API server. Go to the <strong>Cloud</strong> tab to connect.
    </p>
  </div>
);

export default function DashAttendance() {
  const qc = useQueryClient();
  const [isOnline, setIsOnline]       = useState(null);
  const [date, setDate]               = useState(TODAY);
  const [classId, setClassId]         = useState("");
  const [attMap, setAttMap]           = useState({});
  const [notesMap, setNotesMap]       = useState({});
  const [dirty, setDirty]             = useState(false);
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState(null);
  const [histStudent, setHistStudent] = useState(null);

  useEffect(() => { checkApiHealth().then(h => setIsOnline(!!h)); }, []);

  const { data: classData } = useQuery({
    queryKey: ["classes"],
    queryFn: fetchClasses,
    enabled: !!isOnline,
  });
  const classes = classData || [];

  const { data: stuData, isLoading: loadingStu } = useQuery({
    queryKey: ["students-active", classId],
    queryFn: () => fetchStudents({ classId: classId || undefined, status: "ACTIVE", limit: 300 }),
    enabled: !!isOnline,
  });
  const students = stuData?.students || [];

  const { data: attData } = useQuery({
    queryKey: ["attendance", date, classId],
    queryFn: () => fetchAttendance({ date, classId: classId || undefined }),
    enabled: !!isOnline,
  });

  useEffect(() => {
    if (!attData) return;
    const am = {}, nm = {};
    (attData.data || []).forEach(r => {
      am[r.student_id] = r.status;
      if (r.notes) nm[r.student_id] = r.notes;
    });
    setAttMap(am);
    setNotesMap(nm);
    setDirty(false);
  }, [attData]);

  const setStatus = (sid, status) => {
    setAttMap(m => ({ ...m, [sid]: status }));
    setDirty(true);
  };

  const markAll = (status) => {
    const m = {};
    students.forEach(s => { m[s.id] = status; });
    setAttMap(m);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const records = students
      .filter(s => attMap[s.id])
      .map(s => ({ studentId: s.id, date, status: attMap[s.id], notes: notesMap[s.id] || null }));
    try {
      const r = await bulkSaveAttendance(records);
      setMsg(`Saved ${r.saved} records`);
      setDirty(false);
      qc.invalidateQueries(["attendance"]);
    } catch (e) {
      setMsg("Error: " + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  const presentCount  = students.filter(s => attMap[s.id] === "PRESENT").length;
  const absentCount   = students.filter(s => attMap[s.id] === "ABSENT").length;
  const lateCount     = students.filter(s => attMap[s.id] === "LATE").length;
  const markedCount   = students.filter(s => attMap[s.id]).length;
  const rate          = markedCount ? Math.round((presentCount + lateCount * 0.5) / markedCount * 100) : null;

  if (isOnline === null) return <div style={{ padding:60, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Checking connection…</div>;
  if (isOnline === false) return <OfflineState />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy, margin:0 }}>📅 Attendance Register</h1>
        <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, margin:"4px 0 0" }}>Mark and track daily attendance for your students</p>
      </div>

      {/* Controls row */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginBottom:20 }}>
        <input
          type="date" value={date}
          onChange={e => { setDate(e.target.value); setDirty(false); setAttMap({}); setNotesMap({}); }}
          style={{ padding:"9px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:14, outline:"none", color:C.text }}
        />
        <select
          value={classId} onChange={e => setClassId(e.target.value)}
          style={{ padding:"9px 14px", borderRadius:10, border:`1.5px solid ${C.navy}20`, fontFamily:"Nunito", fontSize:14, outline:"none", background:C.white, color:C.text }}
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => markAll("PRESENT")} style={quickBtn("#22C55E")}>✓ All Present</button>
          <button onClick={() => markAll("ABSENT")}  style={quickBtn("#EF4444")}>✗ All Absent</button>
        </div>

        <div style={{ flex:1 }} />

        {msg && (
          <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color: msg.startsWith("Error") ? "#EF4444" : "#22C55E" }}>{msg}</span>
        )}
        <button
          onClick={handleSave}
          disabled={!dirty || saving || !students.length}
          style={{ padding:"9px 22px", borderRadius:10, background: dirty && students.length ? C.coral : `${C.muted}20`, color: dirty && students.length ? C.white : C.muted, border:"none", fontFamily:"Nunito", fontWeight:700, fontSize:14, cursor: dirty && students.length ? "pointer" : "not-allowed", transition:"all 0.15s" }}
        >
          {saving ? "Saving…" : "💾 Save Register"}
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
        {[
          { label:"Students", value: students.length, color: C.navy },
          { label:"Marked",   value: markedCount,     color: "#6C63FF" },
          { label:"Present",  value: presentCount,    color: "#22C55E" },
          { label:"Absent",   value: absentCount,     color: "#EF4444" },
          { label:"Late",     value: lateCount,        color: "#F5A623" },
          { label:"Rate", value: rate !== null ? `${rate}%` : "—", color: rate === null ? C.muted : rate >= 80 ? "#22C55E" : rate >= 60 ? "#F5A623" : "#EF4444" },
        ].map(s => (
          <div key={s.label} style={{ background:C.white, borderRadius:12, padding:"14px 18px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", textAlign:"center", flex:1, minWidth:72 }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:s.color }}>{s.value}</div>
            <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Register table */}
      <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        {loadingStu ? (
          <div style={{ padding:40, textAlign:"center", fontFamily:"Nunito", color:C.muted }}>Loading students…</div>
        ) : students.length === 0 ? (
          <div style={{ padding:48, textAlign:"center" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🎒</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.navy, marginBottom:8 }}>No Active Students</div>
            <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>Add students in the Students tab first, then come back to take attendance.</div>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:`${C.navy}06`, borderBottom:`1px solid ${C.navy}12` }}>
                {["Student", "Class", "Attendance Status", "Notes"].map(h => (
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.navy, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const currentStatus = attMap[s.id];
                return (
                  <tr key={s.id} style={{ borderBottom:`1px solid ${C.navy}08`, background: i%2===0 ? "transparent" : `${C.navy}02` }}>
                    <td style={{ padding:"11px 16px" }}>
                      <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:C.text }}>{s.first_name} {s.last_name}</div>
                      {s.admission_no && <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>#{s.admission_no}</div>}
                    </td>
                    <td style={{ padding:"11px 16px" }}>
                      {s.classes
                        ? <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:s.classes.color||C.navy, background:`${s.classes.color||C.navy}18`, padding:"3px 10px", borderRadius:100 }}>{s.classes.name}</span>
                        : <span style={{ color:C.muted, fontSize:12 }}>—</span>}
                    </td>
                    <td style={{ padding:"11px 16px" }}>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                          <button key={key} onClick={() => setStatus(s.id, key)}
                            style={{
                              padding:"5px 10px", borderRadius:8, cursor:"pointer", transition:"all 0.12s",
                              border:`1.5px solid ${currentStatus===key ? cfg.color : `${C.navy}18`}`,
                              background: currentStatus===key ? cfg.bg : "transparent",
                              color: currentStatus===key ? cfg.color : C.muted,
                              fontFamily:"Nunito", fontWeight:700, fontSize:11,
                            }}
                          >{cfg.short}</button>
                        ))}
                        {currentStatus && (
                          <span style={{ fontFamily:"Nunito", fontSize:11, color:STATUS_CFG[currentStatus].color, fontWeight:700, alignSelf:"center", marginLeft:4 }}>
                            {STATUS_CFG[currentStatus].label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding:"11px 16px" }}>
                      <input
                        type="text" placeholder="Add note…" value={notesMap[s.id] || ""}
                        onChange={e => { setNotesMap(m => ({ ...m, [s.id]: e.target.value })); setDirty(true); }}
                        style={{ padding:"6px 10px", borderRadius:8, border:`1.5px solid ${C.navy}14`, fontFamily:"Nunito", fontSize:12, width:"100%", outline:"none", boxSizing:"border-box", color:C.text }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {students.length > 0 && (
        <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:12, textAlign:"right" }}>
          {markedCount} of {students.length} students marked for {new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </div>
      )}
    </div>
  );
}

const quickBtn = (color) => ({
  padding:"8px 14px", borderRadius:10, border:`1.5px solid ${color}40`,
  background:`${color}12`, color, fontFamily:"Nunito", fontWeight:700,
  fontSize:12, cursor:"pointer",
});
