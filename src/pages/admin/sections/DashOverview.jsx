import { C } from "../../../constants/theme";
import { useAdmin, LEAD_STAGES } from "../../../context/AdminContext";
import { useQuery } from "@tanstack/react-query";
import { fetchOverview } from "../../../api/analytics";

const today = new Date().toDateString();
const thisWeek = new Date(Date.now() - 7*24*60*60*1000).toISOString();

const Stat = ({ icon, label, value, color, sub }) => (
  <div style={{ background:C.white, borderRadius:18, padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:`1px solid ${color}20`, flex:1, minWidth:0 }}>
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
      <div style={{ width:42, height:42, borderRadius:13, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
      <div style={{ fontFamily:"Fredoka One", fontSize:30, color }}>{value}</div>
    </div>
    <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"#333", marginBottom:2 }}>{label}</div>
    {sub && <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted }}>{sub}</div>}
  </div>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:C.white, border:`1.5px solid ${color}25`, borderRadius:12, cursor:"pointer", width:"100%", boxShadow:"0 1px 6px rgba(0,0,0,0.04)", transition:"all 0.15s" }}
    onMouseEnter={e=>e.currentTarget.style.background=`${color}08`}
    onMouseLeave={e=>e.currentTarget.style.background=C.white}
  >
    <span style={{ fontSize:20 }}>{icon}</span>
    <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"#333" }}>{label}</span>
  </button>
);

const fmt = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day:"numeric", month:"short" }) + " · " + d.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
};

export default function DashOverview({ onNavigate }) {
  const { leads } = useAdmin();

  const totalLeads    = leads.length;
  const newToday      = leads.filter(l => new Date(l.createdAt).toDateString() === today).length;
  const newThisWeek   = leads.filter(l => l.createdAt >= thisWeek).length;
  const enrolled      = leads.filter(l => l.status === "enrolled").length;
  const recentLeads   = [...leads].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);

  const stageCount = (id) => leads.filter(l=>l.status===id).length;
  const STATUS_COLORS = { new:"#6C63FF", contacted:C.navy, visit:C.mint, meeting:C.yellow, enrolled:"#22C55E", cold:C.muted };

  const { data: liveData } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchOverview,
    retry: false,
    staleTime: 120000,
  });
  const lv = liveData?.data;

  const PKR = (n) => `PKR ${Number(n || 0).toLocaleString("en-PK")}`;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"Fredoka One", fontSize:26, color:"#1a1a2e", margin:"0 0 4px" }}>Dashboard Overview</h2>
        <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, margin:0 }}>Welcome back — here's what's happening at Mini Muslims Nest.</p>
      </div>

      {/* Live school KPIs (from API) */}
      {lv && (
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
          {[
            { icon:"🎒", label:"Active Students", value: lv.activeStudents ?? "—", color:"#6366f1", sub: `${lv.totalStudents ?? 0} enrolled` },
            { icon:"👩‍🏫", label:"Active Staff",   value: lv.activeStaff ?? "—", color:"#10b981", sub:"teaching & support" },
            { icon:"📅", label:"Attendance Rate", value: lv.attendanceRate != null ? `${lv.attendanceRate}%` : "—", color: lv.attendanceRate >= 80 ? "#10b981" : "#f59e0b", sub:"last 30 days" },
            { icon:"💰", label:"Monthly Revenue", value: PKR(lv.monthlyRevenue), color:"#f59e0b", sub:`of ${PKR(lv.monthlyInvoiced)} invoiced` },
          ].map(c => (
            <div key={c.label} style={{ background:C.white, borderRadius:14, padding:"16px 18px", flex:"1 1 140px", border:`1px solid ${c.color}20`, boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <span style={{ fontSize:22 }}>{c.icon}</span>
                <span style={{ fontFamily:"Fredoka One", fontSize:24, color:c.color }}>{c.value}</span>
              </div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:"#333", marginTop:8 }}>{c.label}</div>
              <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{c.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stats row (CRM) */}
      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:24 }}>
        <Stat icon="👥" label="Total Leads" value={totalLeads} color={C.navy} sub="all time" />
        <Stat icon="🆕" label="New Today"   value={newToday}   color="#6C63FF" sub="last 24h" />
        <Stat icon="📅" label="This Week"   value={newThisWeek} color={C.coral} sub="last 7 days" />
        <Stat icon="✅" label="Enrolled"    value={enrolled}   color="#22C55E" sub="confirmed" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>
        {/* Pipeline */}
        <div>
          <div style={{ background:C.white, borderRadius:18, padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:20 }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e", marginBottom:18 }}>Lead Pipeline</div>
            {LEAD_STAGES.map(({ id, label, icon, color }) => {
              const count = stageCount(id);
              const pct = totalLeads ? Math.round((count/totalLeads)*100) : 0;
              return (
                <div key={id} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontFamily:"Nunito", fontWeight:600, fontSize:13, color:"#333" }}>{icon} {label}</span>
                    <span style={{ fontFamily:"Fredoka One", fontSize:14, color }}>{count} <span style={{ fontSize:11, color:C.muted, fontFamily:"Nunito" }}>({pct}%)</span></span>
                  </div>
                  <div style={{ height:8, background:`${color}18`, borderRadius:100, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:100, transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent leads table */}
          <div style={{ background:C.white, borderRadius:18, padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e" }}>Recent Leads</div>
              <button onClick={()=>onNavigate("leads")} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, background:"none", border:"none", cursor:"pointer" }}>View all →</button>
            </div>
            {recentLeads.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:C.muted, fontFamily:"Nunito", fontSize:13 }}>No leads yet. They'll appear here from contact forms.</div>
            ) : (
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr>
                      {["Name","Contact","Source","Status","Date"].map(h => (
                        <th key={h} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textAlign:"left", padding:"6px 10px", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:`1px solid ${C.navy}10` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map(l => (
                      <tr key={l.id} style={{ cursor:"pointer" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <td style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"#1a1a2e", padding:"10px 10px" }}>{l.name||"—"}</td>
                        <td style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, padding:"10px 10px" }}>{l.phone||l.email||"—"}</td>
                        <td style={{ padding:"10px 10px" }}>
                          <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", background:`${C.navy}12`, color:C.navy, padding:"3px 8px", borderRadius:100 }}>{l.source||"form"}</span>
                        </td>
                        <td style={{ padding:"10px 10px" }}>
                          <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", background:`${STATUS_COLORS[l.status]||C.muted}18`, color:STATUS_COLORS[l.status]||C.muted, padding:"3px 8px", borderRadius:100 }}>{l.status}</span>
                        </td>
                        <td style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, padding:"10px 10px", whiteSpace:"nowrap" }}>{fmt(l.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div style={{ background:C.white, borderRadius:18, padding:"22px 20px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:16, color:"#1a1a2e", marginBottom:14 }}>Quick Actions</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <QuickAction icon="📅" label="Mark Attendance"   color={C.navy}    onClick={()=>onNavigate("attendance")} />
              <QuickAction icon="💰" label="Finance & Invoices" color="#10b981"  onClick={()=>onNavigate("finance")} />
              <QuickAction icon="🤖" label="AI Assistant"      color="#6366f1"   onClick={()=>onNavigate("ai")} />
              <QuickAction icon="➕" label="Add Lead"           color={C.coral}  onClick={()=>onNavigate("leads")} />
              <QuickAction icon="📊" label="Analytics"          color={C.mint}    onClick={()=>onNavigate("analytics")} />
            </div>
          </div>

          <div style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, borderRadius:18, padding:"22px 20px", boxShadow:"0 8px 24px rgba(27,63,139,0.25)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:16, color:C.white, marginBottom:8 }}>Conversion Rate</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:42, color:C.yellow, marginBottom:4 }}>
              {totalLeads ? Math.round((enrolled/totalLeads)*100) : 0}%
            </div>
            <div style={{ fontFamily:"Nunito", fontSize:12, color:"rgba(255,255,255,0.6)" }}>{enrolled} enrolled from {totalLeads} total leads</div>
          </div>
        </div>
      </div>
    </div>
  );
}
