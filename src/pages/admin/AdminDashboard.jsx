import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../constants/theme";
import { ROLE_ACCESS } from "../../context/AdminContext";

import DashOverview  from "./sections/DashOverview";
import DashLeads     from "./sections/DashLeads";
import DashICP       from "./sections/DashICP";
import DashCampaigns from "./sections/DashCampaigns";
import DashContent   from "./sections/DashContent";
import DashBlog      from "./sections/DashBlog";
import DashPages     from "./sections/DashPages";
import DashMedia     from "./sections/DashMedia";
import DashSocial    from "./sections/DashSocial";
import DashSEO       from "./sections/DashSEO";
import DashDesigner  from "./sections/DashDesigner";
import DashUsers     from "./sections/DashUsers";
import DashSettings  from "./sections/DashSettings";
import DashStudents    from "./sections/DashStudents";
import DashAttendance  from "./sections/DashAttendance";
import DashProgress    from "./sections/DashProgress";
import DashLessons     from "./sections/DashLessons";
import DashBehaviour   from "./sections/DashBehaviour";
import DashNutrition   from "./sections/DashNutrition";
import DashParents     from "./sections/DashParents";
import DashFinance     from "./sections/DashFinance";
import DashStaff       from "./sections/DashStaff";
import DashAnalytics   from "./sections/DashAnalytics";
import DashAI          from "./sections/DashAI";
import DashCloud       from "./sections/DashCloud";

const NAV = [
  { id:"overview",    icon:"📊", label:"Overview"      },
  { id:"students",    icon:"🎒", label:"Students"      },
  { id:"attendance",  icon:"📅", label:"Attendance"    },
  { id:"progress",    icon:"📈", label:"Progress"      },
  { id:"lessons",     icon:"📚", label:"Lesson Plans"  },
  { id:"behaviour",   icon:"🧠", label:"Behaviour"     },
  { id:"nutrition",   icon:"🥗", label:"Nutrition"     },
  { id:"parents",     icon:"👪", label:"Parents"       },
  { id:"finance",     icon:"💰", label:"Finance"       },
  { id:"staff",       icon:"👩‍🏫", label:"Staff / HR"    },
  { id:"analytics",   icon:"📊", label:"Analytics"     },
  { id:"ai",          icon:"🤖", label:"AI Assistant"  },
  { id:"leads",       icon:"👥", label:"Leads / CRM"   },
  { id:"icp",        icon:"🎯", label:"ICP Profiles" },
  { id:"campaigns",  icon:"📣", label:"Campaigns"    },
  { id:"content",    icon:"✍️",  label:"Content"      },
  { id:"blog",       icon:"📝", label:"Blog"         },
  { id:"pages",      icon:"📄", label:"Pages"        },
  { id:"media",      icon:"🖼️",  label:"Media"        },
  { id:"social",     icon:"📱", label:"Social Media" },
  { id:"seo",        icon:"🔍", label:"SEO"          },
  { id:"designer",   icon:"🎨", label:"Designer"     },
  { id:"users",      icon:"👤", label:"Users"        },
  { id:"cloud",      icon:"☁️",  label:"Cloud"        },
  { id:"settings",   icon:"⚙️",  label:"Settings"    },
];

const BOTTOM_NAV = ["overview","leads","blog","social","settings"];

const SECTION_MAP = {
  overview: DashOverview, students: DashStudents,
  attendance: DashAttendance, progress: DashProgress, lessons: DashLessons,
  behaviour: DashBehaviour, nutrition: DashNutrition, parents: DashParents,
  finance: DashFinance, staff: DashStaff,
  analytics: DashAnalytics, ai: DashAI,
  leads: DashLeads, icp: DashICP,
  campaigns: DashCampaigns, content: DashContent, blog: DashBlog,
  pages: DashPages, media: DashMedia, social: DashSocial,
  seo: DashSEO, designer: DashDesigner, users: DashUsers,
  cloud: DashCloud, settings: DashSettings,
};

const SIDEBAR_W = 240;
const SIDEBAR_DARK = "#0F1D3E";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab]     = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 860);

  useEffect(() => {
    const sess = sessionStorage.getItem("mmn_admin_session");
    if (!sess) { navigate("/admin"); return; }
    setCurrentUser(JSON.parse(sess));
  }, [navigate]);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 860);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("mmn_admin_session");
    navigate("/admin");
  };

  if (!currentUser) return null;

  const access = ROLE_ACCESS[currentUser.role?.toLowerCase()] || ["overview"];
  const visibleNav = NAV.filter(n => access.includes(n.id));
  const visibleBottom = NAV.filter(n => BOTTOM_NAV.includes(n.id) && access.includes(n.id));

  const ActiveSection = SECTION_MAP[activeTab] || DashOverview;

  const navItemStyle = (id) => ({
    display:"flex", alignItems:"center", gap:12, padding:"11px 18px",
    borderRadius:12, cursor:"pointer", margin:"2px 10px",
    background: activeTab === id ? "rgba(255,255,255,0.13)" : "transparent",
    borderLeft: activeTab === id ? `3px solid ${C.coral}` : "3px solid transparent",
    transition:"all 0.18s",
    color: activeTab === id ? C.white : "rgba(255,255,255,0.6)",
  });

  const goTo = (id) => { setActiveTab(id); setSidebarOpen(false); };

  const Sidebar = () => (
    <div style={{ width:SIDEBAR_W, background:SIDEBAR_DARK, display:"flex", flexDirection:"column", height:"100%", position:"relative", zIndex:10 }}>
      {/* Brand */}
      <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🕌</div>
          <div>
            <div style={{ fontFamily:"Fredoka One", fontSize:16, color:C.white, lineHeight:1 }}>MMN Admin</div>
            <div style={{ fontFamily:"Nunito", fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:2 }}>Control Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 0" }}>
        {visibleNav.map(n => (
          <div key={n.id} style={navItemStyle(n.id)} onClick={() => goTo(n.id)}
            onMouseEnter={e=>{ if(activeTab!==n.id) e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
            onMouseLeave={e=>{ if(activeTab!==n.id) e.currentTarget.style.background="transparent"; }}
          >
            <span style={{ fontSize:17, width:22, textAlign:"center" }}>{n.icon}</span>
            <span style={{ fontFamily:"Nunito", fontWeight:600, fontSize:13.5 }}>{n.label}</span>
          </div>
        ))}
      </div>

      {/* User card */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", padding:"16px 16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${C.coral},${C.yellow})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{currentUser.avatar}</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.white, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{currentUser.name}</div>
            <div style={{ fontFamily:"Nunito", fontSize:11, color:"rgba(255,255,255,0.4)" }}>{currentUser.role}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => window.open("/","_blank")} style={{ flex:1, background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.65)", border:"1px solid rgba(255,255,255,0.15)", fontFamily:"Nunito", fontWeight:600, fontSize:11, padding:"7px 4px", borderRadius:8, cursor:"pointer" }}>↗ Site</button>
          <button onClick={logout} style={{ flex:1, background:`${C.coral}20`, color:C.coral, border:`1px solid ${C.coral}40`, fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"7px 4px", borderRadius:8, cursor:"pointer" }}>Logout</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#F5F6FA" }}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200 }}/>
          <div style={{ position:"fixed", left:0, top:0, bottom:0, width:SIDEBAR_W, zIndex:201 }}><Sidebar /></div>
        </>
      )}

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Top bar (mobile) */}
        {isMobile && (
          <div style={{ background:SIDEBAR_DARK, padding:"0 16px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <button onClick={()=>setSidebarOpen(true)} style={{ background:"none", border:"none", color:C.white, fontSize:22, cursor:"pointer", padding:4 }}>☰</button>
            <span style={{ fontFamily:"Fredoka One", fontSize:18, color:C.white }}>
              {NAV.find(n=>n.id===activeTab)?.icon} {NAV.find(n=>n.id===activeTab)?.label}
            </span>
            <div style={{ width:32 }}/>
          </div>
        )}

        {/* Desktop top bar */}
        {!isMobile && (
          <div style={{ background:C.white, borderBottom:"1px solid #E8EAF0", padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div>
              <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>
                {NAV.find(n=>n.id===activeTab)?.icon}&nbsp; {NAV.find(n=>n.id===activeTab)?.label}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <span style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>{new Date().toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })}</span>
              <button onClick={()=>window.open("/","_blank")} style={{ background:`${C.navy}10`, color:C.navy, border:`1px solid ${C.navy}20`, fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"6px 16px", borderRadius:100, cursor:"pointer" }}>↗ View Site</button>
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "16px 12px 80px" : "28px 32px" }}>
          <ActiveSection currentUser={currentUser} onNavigate={goTo} />
        </div>

        {/* Mobile bottom nav */}
        {isMobile && (
          <div style={{ position:"fixed", bottom:0, left:0, right:0, background:SIDEBAR_DARK, display:"flex", borderTop:"1px solid rgba(255,255,255,0.1)", zIndex:100 }}>
            {visibleBottom.map(n => (
              <button key={n.id} onClick={()=>goTo(n.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 4px 12px", background:"none", border:"none", cursor:"pointer", color: activeTab===n.id ? C.coral : "rgba(255,255,255,0.5)", transition:"color 0.15s" }}>
                <span style={{ fontSize:20 }}>{n.icon}</span>
                <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:9, letterSpacing:"0.03em" }}>{n.label.split(" ")[0]}</span>
              </button>
            ))}
            <button onClick={()=>setSidebarOpen(true)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"10px 4px 12px", background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.5)" }}>
              <span style={{ fontSize:20 }}>☰</span>
              <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:9 }}>More</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

