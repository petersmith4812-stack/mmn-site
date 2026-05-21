import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/theme";
import {
  fetchParentMe, fetchParentAttendance, fetchParentProgress,
  fetchParentNutrition, fetchParentBehaviour, fetchParentMessages,
} from "../../api/parentPortal";

const TABS = [
  { id:"overview",    icon:"🏠", label:"Overview"    },
  { id:"attendance",  icon:"📅", label:"Attendance"  },
  { id:"progress",    icon:"📈", label:"Progress"    },
  { id:"daily",       icon:"📋", label:"Daily Log"   },
  { id:"messages",    icon:"💬", label:"Messages"    },
];

const DOMAINS = [
  { key:"Language & Literacy",        icon:"📖", color:"#1B3F8B" },
  { key:"Mathematics",                icon:"🔢", color:"#4BAE95" },
  { key:"Physical Development",       icon:"🏃", color:"#F0876A" },
  { key:"Social-Emotional",           icon:"❤️",  color:"#E91E63" },
  { key:"Creative Arts",              icon:"🎨", color:"#9B59B6" },
  { key:"Islamic Studies",            icon:"☪️",  color:"#2E7D32" },
  { key:"Arabic",                     icon:"🌙", color:"#00838F" },
  { key:"Understanding of the World", icon:"🌍", color:"#5D4037" },
];

const LEVEL_ORDER = { EMERGING:1, DEVELOPING:2, SECURE:3, MASTERED:4 };
const LEVEL_CFG   = {
  EMERGING:   { color:"#F5A623", label:"Emerging" },
  DEVELOPING: { color:"#1B3F8B", label:"Developing" },
  SECURE:     { color:"#4BAE95", label:"Secure" },
  MASTERED:   { color:"#22C55E", label:"Mastered" },
};

const ATT_CFG = {
  PRESENT:  { color:"#22C55E", short:"P" },
  ABSENT:   { color:"#EF4444", short:"A" },
  LATE:     { color:"#F5A623", short:"L" },
  EXCUSED:  { color:"#6C63FF", short:"E" },
  HALF_DAY: { color:"#0EA5E9", short:"H" },
};

const MEALS = {
  BREAKFAST:       { label:"Breakfast",       icon:"🌅" },
  MORNING_SNACK:   { label:"Morning Snack",   icon:"🍎" },
  LUNCH:           { label:"Lunch",           icon:"🌞" },
  AFTERNOON_SNACK: { label:"Afternoon Snack", icon:"🥪" },
};

const PORTION_CFG = {
  ALL:    { label:"All",    color:"#22C55E" },
  MOST:   { label:"Most",   color:"#4BAE95" },
  HALF:   { label:"Half",   color:"#F5A623" },
  LITTLE: { label:"Little", color:"#F0876A" },
  NONE:   { label:"None",   color:"#EF4444" },
};

const TODAY = new Date().toISOString().slice(0,10);
const getMonthDays = (y, m) => new Date(y, m+1, 0).getDate();
const getFirstDay  = (y, m) => new Date(y, m, 1).getDay();

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [session, setSession]     = useState(null);
  const [student, setStudent]     = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [parentInfo, setParentInfo] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [progress, setProgress]   = useState([]);
  const [nutrition, setNutrition] = useState([]);
  const [behaviour, setBehaviour] = useState([]);
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [calMonth, setCalMonth]   = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }));

  useEffect(() => {
    const raw = sessionStorage.getItem("mmn_parent_session");
    if (!raw) { navigate("/parent"); return; }
    const sess = JSON.parse(raw);
    setSession(sess);
    setStudent(sess.students?.[0] || null);
  }, [navigate]);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    Promise.all([
      fetchParentMe().catch(() => null),
      fetchParentAttendance({ studentId: student.id }).catch(() => ({ data: [] })),
      fetchParentProgress({ studentId: student.id }).catch(() => ({ data: [] })),
      fetchParentNutrition({ studentId: student.id, date: TODAY }).catch(() => ({ data: [] })),
      fetchParentBehaviour({ studentId: student.id }).catch(() => ({ data: [] })),
    ]).then(([me, att, prog, nut, beh]) => {
      setParentInfo(me?.data);
      setAttendance(att?.data || []);
      setProgress(prog?.data || []);
      setNutrition(nut?.data || []);
      setBehaviour(beh?.data || []);
      setLoading(false);
    });
  }, [student]);

  useEffect(() => {
    if (activeTab === "messages" && student) {
      fetchParentMessages().then(r => setMessages(r?.data || [])).catch(() => {});
    }
  }, [activeTab, student]);

  const logout = () => {
    sessionStorage.removeItem("mmn_parent_token");
    sessionStorage.removeItem("mmn_parent_session");
    navigate("/parent");
  };

  if (!session || !student) return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(135deg,${C.navy},#1a2e5a)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:C.white, fontFamily:"Nunito", fontSize:18 }}>Loading…</div>
    </div>
  );

  const todayAtt = attendance.find(a => a.date === TODAY);
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
  const attRate = totalDays ? Math.round(presentDays / totalDays * 100) : null;

  // Build attendance map for calendar
  const attMap = attendance.reduce((m, a) => { m[a.date] = a.status; return m; }, {});

  // Best progress level per domain
  const domainBest = DOMAINS.map(d => {
    const recs = progress.filter(r => r.domain === d.key);
    const best = recs.reduce((b, r) => LEVEL_ORDER[r.level] > LEVEL_ORDER[b?.level || "EMERGING"] ? r : b, null);
    return { ...d, best, count: recs.length };
  }).filter(d => d.count > 0);

  return (
    <div style={{ minHeight:"100vh", background:"#F5F6FA", fontFamily:"Nunito" }}>
      {/* Top nav */}
      <div style={{ background:C.navy, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🕌</div>
          <div>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:C.white, lineHeight:1 }}>Mini Muslims Nest</div>
            <div style={{ fontFamily:"Nunito", fontSize:10, color:"rgba(255,255,255,0.5)" }}>Parent Portal</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {session.students?.length > 1 && (
            <select value={student.id} onChange={e => setStudent(session.students.find(s => s.id === e.target.value))}
              style={{ padding:"6px 12px", borderRadius:8, border:"none", fontFamily:"Nunito", fontSize:13, background:"rgba(255,255,255,0.12)", color:C.white, outline:"none" }}>
              {session.students.map(s => <option key={s.id} value={s.id} style={{ color:C.text }}>{s.firstName} {s.lastName}</option>)}
            </select>
          )}
          <div style={{ fontFamily:"Nunito", fontSize:13, color:"rgba(255,255,255,0.7)" }}>
            Welcome, {session.firstName}
          </div>
          <button onClick={logout} style={{ padding:"6px 14px", borderRadius:8, background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.2)", fontFamily:"Nunito", fontWeight:700, fontSize:12, cursor:"pointer" }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background:C.white, borderBottom:"1px solid #E8EAF0", display:"flex", overflowX:"auto" }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding:"14px 20px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, color: activeTab===tab.id ? C.coral : C.muted, borderBottom: activeTab===tab.id ? `2px solid ${C.coral}` : "2px solid transparent", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", transition:"color 0.15s" }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"28px 20px 60px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:60, fontFamily:"Nunito", color:C.muted, fontSize:16 }}>Loading your child's information…</div>
        ) : (
          <>
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div>
                {/* Child card */}
                <div style={{ background:C.white, borderRadius:20, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"24px 28px", marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:20 }}>
                    <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, flexShrink:0 }}>
                      {student.gender === "FEMALE" ? "👧" : "👦"}
                    </div>
                    <div>
                      <div style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy }}>{student.firstName} {student.lastName}</div>
                      {student.class && <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, marginTop:2 }}>{student.class.name} Class</div>}
                      <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>
                        {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                      </div>
                    </div>
                    <div style={{ marginLeft:"auto", textAlign:"right" }}>
                      {todayAtt ? (
                        <div>
                          <span style={{ fontFamily:"Fredoka One", fontSize:18, color: ATT_CFG[todayAtt.status]?.color || C.navy }}>
                            {todayAtt.status.replace("_"," ")}
                          </span>
                          <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>Today's Status</div>
                        </div>
                      ) : (
                        <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>Attendance not yet marked</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
                  <StatCard icon="📅" label="Attendance Rate" value={attRate !== null ? `${attRate}%` : "—"} sub={`${presentDays} of ${totalDays} days`} color={attRate >= 80 ? "#22C55E" : attRate >= 60 ? "#F5A623" : "#EF4444"} />
                  <StatCard icon="📈" label="Milestones" value={progress.length} sub={`across ${domainBest.length} domains`} color={C.navy} />
                  <StatCard icon="💬" label="Messages" value={messages.length || "—"} sub="from school" color={C.coral} />
                </div>

                {/* Today's meals quick view */}
                {nutrition.length > 0 && (
                  <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px 24px", marginBottom:20 }}>
                    <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.navy, marginBottom:14 }}>🥗 Today's Meals</div>
                    <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                      {nutrition.map(m => (
                        <div key={m.id} style={{ background:`${C.navy}05`, borderRadius:12, padding:"12px 16px", flex:1, minWidth:140 }}>
                          <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{MEALS[m.meal]?.icon} {MEALS[m.meal]?.label}</div>
                          <div style={{ fontFamily:"Nunito", fontSize:13, color:C.text, marginBottom:4 }}>{m.items?.join(", ") || "—"}</div>
                          {m.portion_eaten && (
                            <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:PORTION_CFG[m.portion_eaten]?.color, background:`${PORTION_CFG[m.portion_eaten]?.color}14`, padding:"2px 8px", borderRadius:100 }}>
                              {PORTION_CFG[m.portion_eaten]?.label}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent positive behaviours */}
                {behaviour.length > 0 && (
                  <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px 24px" }}>
                    <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.navy, marginBottom:14 }}>✅ Recent Highlights</div>
                    {behaviour.slice(0,3).map(b => (
                      <div key={b.id} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.navy}08` }}>
                        <span style={{ fontSize:20 }}>⭐</span>
                        <div>
                          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>{b.behaviour}</div>
                          <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{new Date(b.observed_at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ATTENDANCE */}
            {activeTab === "attendance" && (
              <div>
                <div style={{ background:C.white, borderRadius:20, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"24px 28px", marginBottom:20 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                    <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy }}>📅 Attendance</div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => setCalMonth(m => { const nm = m.m===0 ? {y:m.y-1,m:11} : {y:m.y,m:m.m-1}; return nm; })} style={calNavBtn}>‹</button>
                      <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:15, color:C.navy, minWidth:130, textAlign:"center" }}>
                        {new Date(calMonth.y, calMonth.m, 1).toLocaleDateString("en-GB",{month:"long",year:"numeric"})}
                      </div>
                      <button onClick={() => setCalMonth(m => { const nm = m.m===11 ? {y:m.y+1,m:0} : {y:m.y,m:m.m+1}; return nm; })} style={calNavBtn}>›</button>
                    </div>
                  </div>
                  {/* Stats */}
                  <div style={{ display:"flex", gap:12, marginBottom:20 }}>
                    {Object.entries(ATT_CFG).map(([k, cfg]) => {
                      const n = attendance.filter(a => a.status===k).length;
                      return n > 0 ? (
                        <div key={k} style={{ background:`${cfg.color}10`, borderRadius:10, padding:"10px 14px", textAlign:"center", minWidth:60 }}>
                          <div style={{ fontFamily:"Fredoka One", fontSize:20, color:cfg.color }}>{n}</div>
                          <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{k.replace("_"," ")}</div>
                        </div>
                      ) : null;
                    })}
                    {attRate !== null && (
                      <div style={{ background:`${attRate>=80?"#22C55E":attRate>=60?"#F5A623":"#EF4444"}10`, borderRadius:10, padding:"10px 14px", textAlign:"center", minWidth:60 }}>
                        <div style={{ fontFamily:"Fredoka One", fontSize:20, color:attRate>=80?"#22C55E":attRate>=60?"#F5A623":"#EF4444" }}>{attRate}%</div>
                        <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>Rate</div>
                      </div>
                    )}
                  </div>
                  {/* Calendar grid */}
                  <CalendarGrid year={calMonth.y} month={calMonth.m} attMap={attMap} />
                </div>
              </div>
            )}

            {/* PROGRESS */}
            {activeTab === "progress" && (
              <div>
                <div style={{ background:C.white, borderRadius:20, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"24px 28px", marginBottom:20 }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:8 }}>📈 Learning Progress</div>
                  <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>
                    {student.firstName}'s developmental milestones across all learning areas
                  </div>
                  {progress.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"32px 0", color:C.muted, fontFamily:"Nunito" }}>No progress records yet. Records will appear as your child's teacher logs milestones.</div>
                  ) : DOMAINS.map(d => {
                    const recs = progress.filter(r => r.domain === d.key);
                    if (!recs.length) return null;
                    return (
                      <div key={d.key} style={{ marginBottom:20 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                          <span style={{ fontSize:18 }}>{d.icon}</span>
                          <span style={{ fontFamily:"Fredoka One", fontSize:16, color:d.color }}>{d.key}</span>
                          <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:d.color, background:`${d.color}14`, padding:"2px 8px", borderRadius:100 }}>{recs.length}</span>
                        </div>
                        {recs.map(r => (
                          <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:`${d.color}06`, borderRadius:10, marginBottom:6, borderLeft:`3px solid ${d.color}` }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>{r.objective}</div>
                              {r.notes && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:2 }}>{r.notes}</div>}
                            </div>
                            <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", background:`${LEVEL_CFG[r.level]?.color}18`, color:LEVEL_CFG[r.level]?.color, padding:"3px 9px", borderRadius:100, flexShrink:0 }}>
                              {LEVEL_CFG[r.level]?.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAILY LOG */}
            {activeTab === "daily" && (
              <div>
                <div style={{ background:C.white, borderRadius:20, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"24px 28px", marginBottom:20 }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:4 }}>📋 Today's Log</div>
                  <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>
                    {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </div>
                  {/* Meals */}
                  <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.navy, marginBottom:12 }}>🥗 Meals</div>
                  {nutrition.length === 0 ? (
                    <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>No meal records for today yet.</div>
                  ) : (
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
                      {nutrition.map(m => (
                        <div key={m.id} style={{ background:`${C.navy}05`, borderRadius:12, padding:"14px 18px" }}>
                          <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{MEALS[m.meal]?.icon} {MEALS[m.meal]?.label}</div>
                          <div style={{ fontFamily:"Nunito", fontSize:13, color:C.text, marginBottom:6 }}>{m.items?.join(", ") || "—"}</div>
                          {m.portion_eaten && (
                            <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:PORTION_CFG[m.portion_eaten]?.color }}>
                              Ate: {PORTION_CFG[m.portion_eaten]?.label}
                            </span>
                          )}
                          {m.notes && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:4, fontStyle:"italic" }}>{m.notes}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Today's behaviour highlights */}
                  <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.navy, marginBottom:12 }}>✅ Today's Highlights</div>
                  {behaviour.filter(b => b.observed_at?.slice(0,10) === TODAY).length === 0 ? (
                    <div style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>No highlights recorded for today yet.</div>
                  ) : behaviour.filter(b => b.observed_at?.slice(0,10) === TODAY).map(b => (
                    <div key={b.id} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"12px 16px", background:"#22C55E08", borderRadius:12, marginBottom:8, borderLeft:"3px solid #22C55E" }}>
                      <span style={{ fontSize:18 }}>⭐</span>
                      <div>
                        <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>{b.behaviour}</div>
                        {b.notes && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:2 }}>{b.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === "messages" && (
              <div>
                <div style={{ background:C.white, borderRadius:20, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", padding:"24px 28px" }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:20 }}>💬 Messages from School</div>
                  {messages.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"40px 0" }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>📭</div>
                      <div style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>No messages yet.</div>
                    </div>
                  ) : messages.map(msg => (
                    <div key={msg.id} style={{ padding:"16px 20px", background:`${C.navy}04`, borderRadius:14, marginBottom:12, borderLeft:`3px solid ${C.coral}` }}>
                      <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:14, color:C.navy, marginBottom:4 }}>{msg.subject}</div>
                      <div style={{ fontFamily:"Nunito", fontSize:13, color:C.text, lineHeight:1.6, marginBottom:8, whiteSpace:"pre-wrap" }}>{msg.body}</div>
                      <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>
                        {new Date(msg.created_at).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                        {msg.students && ` · Re: ${msg.students.first_name} ${msg.students.last_name}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const CalendarGrid = ({ year, month, attMap }) => {
  const days = getMonthDays(year, month);
  const firstDay = (getFirstDay(year, month) + 6) % 7; // Monday=0
  const cells = Array(firstDay).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
  const today = new Date();

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:4 }}>
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} style={{ textAlign:"center", fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, padding:"4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const status = attMap[dateStr];
          const cfg = status ? ATT_CFG[status] : null;
          const isToday = dateStr === new Date().toISOString().slice(0,10);
          const isWeekend = (i % 7) >= 5;
          return (
            <div key={i} style={{ aspectRatio:"1", borderRadius:8, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:2, background: cfg ? `${cfg.color}18` : isWeekend ? "#f9f9f9" : `${C.navy}04`, border: isToday ? `2px solid ${C.coral}` : "1px solid transparent" }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color: cfg ? cfg.color : isWeekend ? C.muted : C.text }}>{day}</div>
              {cfg && <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:9, color:cfg.color }}>{cfg.short}</div>}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
        {Object.entries(ATT_CFG).map(([k,v]) => (
          <div key={k} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:12, height:12, borderRadius:3, background:v.color }}/>
            <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{k.replace("_"," ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"18px 20px", textAlign:"center" }}>
    <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
    <div style={{ fontFamily:"Fredoka One", fontSize:26, color }}>{value}</div>
    <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy }}>{label}</div>
    {sub && <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginTop:2 }}>{sub}</div>}
  </div>
);

const calNavBtn = { padding:"6px 14px", borderRadius:8, border:`1.5px solid ${C.navy}20`, background:"transparent", color:C.navy, fontFamily:"Nunito", fontWeight:800, fontSize:16, cursor:"pointer", lineHeight:1 };
