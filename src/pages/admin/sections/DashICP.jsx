import { useState, useEffect, useCallback, useRef } from "react";
import { C } from "../../../constants/theme";
import { useAdmin } from "../../../context/AdminContext";

const API = "http://localhost:4000/api";

// ── localStorage helpers ───────────────────────────────────────────────────
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ── ICP scoring for scraped leads ──────────────────────────────────────────
function scoreScrapedLead(lead, icp) {
  let score = 30; // base: they appeared in targeted searches
  const bio  = (lead.bio || lead.headline || "").toLowerCase();
  const loc  = (lead.location || "").toLowerCase();

  const lahoreKw = ["lahore","dha","gulberg","bahria","johar","model town"];
  if (lahoreKw.some(k => loc.includes(k) || bio.includes(k))) score += 20;

  if (icp?.locations?.length) {
    const matched = icp.locations.some(l => loc.includes(l.toLowerCase()) || bio.includes(l.toLowerCase()));
    if (matched) score += 10;
  }

  const islamicKw = ["islam","muslim","quran","allah","hijab","deen","islamic","ummah","hijabi"];
  if (islamicKw.some(k => bio.includes(k))) score += 20;

  const parentKw = ["mom","mother","mama","parent","baby","toddler","preschool","child","kids","daughter","son","nurtur"];
  if (parentKw.some(k => bio.includes(k))) score += 15;

  const eduKw = ["montessori","reggio","waldorf","unschool","homeschool","education","learning","teach"];
  if (eduKw.some(k => bio.includes(k))) score += 10;

  if (lead.email) score += 5;
  if (lead.phone) score += 5;
  if (!lead.bio && !lead.headline) score -= 15;

  return Math.min(100, Math.max(0, score));
}

// ── Platform config ────────────────────────────────────────────────────────
const PLATFORMS = [
  { id:"facebook",  label:"Facebook",  color:"#1877F2", icon:"f", desc:"Groups, people search, parent communities" },
  { id:"instagram", label:"Instagram", color:"#E1306C", icon:"IG", desc:"Hashtags: #lahoremoms #islamicparenting" },
  { id:"linkedin",  label:"LinkedIn",  color:"#0A66C2", icon:"in", desc:"Professional mothers in Lahore" },
];

const PLATFORM_COLOR = { facebook:"#1877F2", instagram:"#E1306C", linkedin:"#0A66C2" };
const STATUS_COLOR   = { running:"#F5C518", completed:"#22C55E", error:C.coral, cancelled:C.muted, idle:C.muted };

// ── ICP editor defaults ────────────────────────────────────────────────────
const AGE_RANGES   = ["1–2 years","2–3 years","3–4 years","4–5 years","5–6 years","6–7 years"];
const COMMITMENT   = ["Very High (practices daily)","High (practicing family)","Moderate (cultural Muslim)"];
const PHILOSOPHY   = ["Reggio Emilia","Montessori","Waldorf","Traditional","Any / Open"];
const LOCATIONS    = ["DHA Lahore","Gulberg","Model Town","Bahria Town","Johar Town","Other Lahore"];
const BLANK_ICP    = { name:"", ageRanges:[], commitment:[], philosophy:[], locations:[], motherPresence:null, customFbGroups:[], customIgHashtags:[] };

// ── Small reusable pieces ──────────────────────────────────────────────────
const Chip = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{ padding:"5px 12px", borderRadius:100, border:`1.5px solid ${active?C.navy:`${C.navy}20`}`, background:active?C.navy:"transparent", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11.5, color:active?C.white:C.text, marginBottom:4, marginRight:4 }}>{label}</button>
);

const MultiChip = ({ options, selected, onChange }) => (
  <div style={{ display:"flex", flexWrap:"wrap" }}>
    {options.map(o => <Chip key={o} label={o} active={selected.includes(o)} onClick={() => onChange(selected.includes(o) ? selected.filter(x=>x!==o) : [...selected,o])} />)}
  </div>
);

const ScorePill = ({ score }) => {
  const bg = score>=70?"#22C55E":score>=40?C.yellow:C.coral;
  return <span style={{ fontFamily:"Fredoka One", fontSize:12, color:"#fff", background:bg, padding:"2px 9px", borderRadius:100, whiteSpace:"nowrap" }}>{score}%</span>;
};

const PlatformBadge = ({ platform }) => (
  <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:10, color:"#fff", background:PLATFORM_COLOR[platform]||C.muted, padding:"2px 8px", borderRadius:100 }}>{platform}</span>
);

const StatusDot = ({ status }) => (
  <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:STATUS_COLOR[status]||C.muted, marginRight:6 }}/>
);

// ── Main component ─────────────────────────────────────────────────────────
export default function DashICP() {
  const { icps, addICP, updateICP, deleteICP, addLead } = useAdmin();

  const [tab,          setTab]          = useState("home");       // home | scraper | pool | editor
  const [serverOnline, setServerOnline] = useState(null);         // null=checking
  // per-platform job summaries (reserved for future multi-job tracking)
  const [activeJobId,  setActiveJobId]  = useState(null);
  const [jobStatus,    setJobStatus]    = useState(null);
  const [scrapedLeads, setScrapedLeads] = useState(() => lsGet("mmn_scraped_leads", []));
  const [addedIds,     setAddedIds]     = useState(new Set());
  const [scoreFilter,  setScoreFilter]  = useState(40);
  const [poolFilter,   setPoolFilter]   = useState("all");
  const [selectedIcp,  setSelectedIcp]  = useState(null);

  // ICP editor state
  const [editView,  setEditView]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [draft,     setDraft]     = useState(BLANK_ICP);
  const [confirmDel,setConfirmDel]= useState(null);

  const logEndRef = useRef(null);

  // ── Server health polling ──────────────────────────────────────────────
  useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
        setServerOnline(r.ok);
      } catch {
        setServerOnline(false);
      }
    };
    check();
    const iv = setInterval(check, 8000);
    return () => clearInterval(iv);
  }, []);

  // ── Job status polling ─────────────────────────────────────────────────
  useEffect(() => {
    if (!activeJobId) return;
    const iv = setInterval(async () => {
      try {
        const r  = await fetch(`${API}/scrape/status/${activeJobId}`);
        const data = await r.json();
        setJobStatus(data);

        if (data.status === "completed" || data.status === "error" || data.status === "cancelled") {
          clearInterval(iv);
          // Fetch final results
          try {
            const rr = await fetch(`${API}/scrape/results/${activeJobId}`);
            const { leads } = await rr.json();
            if (leads?.length) {
              const scored = leads.map(l => ({ ...l, _id: Math.random().toString(36).slice(2), _icpScore: scoreScrapedLead(l, selectedIcp) }));
              setScrapedLeads(prev => {
                const merged = [...scored, ...prev];
                lsSet("mmn_scraped_leads", merged);
                return merged;
              });
            }
          } catch {}
        }
      } catch {}
    }, 2500);
    return () => clearInterval(iv);
  }, [activeJobId, selectedIcp]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [jobStatus?.logs]);

  // ── Start scrape ───────────────────────────────────────────────────────
  const startScrape = useCallback(async (platform) => {
    if (!serverOnline) return;
    try {
      const r = await fetch(`${API}/scrape/start`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ platform, icp: selectedIcp }),
      });
      const data = await r.json();
      if (data.jobId) {
        setActiveJobId(data.jobId);
        setJobStatus(null);
        setTab("scraper");
      } else {
        alert(data.error || "Failed to start job");
      }
    } catch (err) {
      alert("Cannot reach scraper server. Is it running?\n\ncd server && npm start");
    }
  }, [serverOnline, selectedIcp]);

  const cancelJob = async () => {
    if (!activeJobId) return;
    await fetch(`${API}/scrape/${activeJobId}`, { method:"DELETE" });
  };

  // ── Add lead to CRM ────────────────────────────────────────────────────
  const pushToCRM = (lead) => {
    addLead({
      name:    lead.name,
      email:   lead.email,
      phone:   lead.phone,
      message: lead.bio || lead.headline || "",
      source:  lead.platform,
      profileUrl: lead.profileUrl,
      location:   lead.location,
    });
    setAddedIds(prev => new Set([...prev, lead._id]));
  };

  const pushAllToCRM = () => {
    visibleLeads.filter(l => !addedIds.has(l._id)).forEach(pushToCRM);
  };

  // ── ICP editor helpers ─────────────────────────────────────────────────
  const setF = (k, v) => setDraft(p => ({ ...p, [k]:v }));
  const openNew  = ()    => { setDraft(BLANK_ICP); setEditId(null); setEditView(true); };
  const openEdit = (icp) => { setDraft({...icp}); setEditId(icp.id); setEditView(true); };
  const saveICP  = ()    => {
    if (!draft.name.trim()) return;
    if (editId) updateICP(editId, draft); else addICP(draft);
    setEditView(false);
  };

  // ── Filtered lead pool ─────────────────────────────────────────────────
  const visibleLeads = scrapedLeads
    .map(l => ({ ...l, _icpScore: l._icpScore ?? scoreScrapedLead(l, selectedIcp) }))
    .filter(l => poolFilter === "all" || l.platform === poolFilter)
    .filter(l => l._icpScore >= scoreFilter)
    .sort((a,b) => b._icpScore - a._icpScore);

  const running = jobStatus?.status === "running";
  const baseInput = { width:"100%", padding:"10px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };

  // ── Server offline banner ──────────────────────────────────────────────
  const ServerBanner = () => (
    <div style={{ padding:"14px 18px", borderRadius:12, background:serverOnline?`${C.mint}12`:`${C.coral}12`, border:`1.5px solid ${serverOnline?C.mint:C.coral}30`, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ width:10, height:10, borderRadius:"50%", background:serverOnline?"#22C55E":serverOnline===null?"#F5C518":C.coral, display:"inline-block" }}/>
        <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.text }}>
          {serverOnline===null?"Connecting to scraper server…":serverOnline?"Scraper server online — ready to find leads":"Scraper server offline"}
        </span>
      </div>
      {!serverOnline && serverOnline!==null && (
        <code style={{ fontFamily:"monospace", fontSize:12, background:"rgba(0,0,0,0.06)", padding:"6px 12px", borderRadius:8, color:C.text }}>
          cd server &amp;&amp; npm install &amp;&amp; npm start
        </code>
      )}
    </div>
  );

  // ── Tab bar ────────────────────────────────────────────────────────────
  const TABS = [
    { id:"home",    label:"Home" },
    { id:"scraper", label:`Console${running?" ⟳":""}` },
    { id:"pool",    label:`Lead Pool (${scrapedLeads.length})` },
    { id:"editor",  label:"ICP Profiles" },
  ];

  const TabBar = () => (
    <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:`2px solid ${C.navy}10`, paddingBottom:0 }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ padding:"9px 18px", border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, background:"transparent", color:tab===t.id?C.navy:C.muted, borderBottom:tab===t.id?`3px solid ${C.navy}`:"3px solid transparent", marginBottom:-2 }}>
          {t.label}
        </button>
      ))}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // HOME TAB
  // ══════════════════════════════════════════════════════════════════════
  const HomeTab = () => (
    <div>
      <ServerBanner />

      {/* ICP selector */}
      <div style={{ background:C.white, borderRadius:14, padding:"18px 22px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginBottom:20 }}>
        <div style={{ fontFamily:"Fredoka One", fontSize:16, color:"#1a1a2e", marginBottom:12 }}>Active ICP for Scraping</div>
        {icps.length === 0 ? (
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <span style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>No ICP profiles yet.</span>
            <button onClick={() => { setTab("editor"); openNew(); }} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 16px", borderRadius:100 }}>Create ICP</button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
            <button onClick={() => setSelectedIcp(null)} style={{ padding:"7px 16px", borderRadius:100, border:`1.5px solid ${!selectedIcp?C.navy:`${C.navy}20`}`, background:!selectedIcp?C.navy:"transparent", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:!selectedIcp?C.white:C.text }}>Default (all)</button>
            {icps.map(icp => (
              <button key={icp.id} onClick={() => setSelectedIcp(icp)} style={{ padding:"7px 16px", borderRadius:100, border:`1.5px solid ${selectedIcp?.id===icp.id?C.navy:`${C.navy}20`}`, background:selectedIcp?.id===icp.id?C.navy:"transparent", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:selectedIcp?.id===icp.id?C.white:C.text }}>
                {icp.name}
              </button>
            ))}
          </div>
        )}
        {selectedIcp && (
          <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
            {[...(selectedIcp.ageRanges||[]),...(selectedIcp.commitment||[]),...(selectedIcp.locations||[]),...(selectedIcp.philosophy||[])].map((t,i) => (
              <span key={i} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, background:`${C.navy}10`, color:C.navy, padding:"2px 9px", borderRadius:100 }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Platform cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:24 }}>
        {PLATFORMS.map(p => {
          const platformLeads = scrapedLeads.filter(l => l.platform === p.id);
          const isRunning = jobStatus?.status==="running" && jobStatus?.platform===p.id;
          return (
            <div key={p.id} style={{ background:C.white, borderRadius:16, padding:"22px 22px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:42, height:42, borderRadius:12, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Fredoka One", fontSize:15, color:"#fff", letterSpacing:-0.5 }}>{p.icon}</div>
                <div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e" }}>{p.label}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted }}>{p.desc}</div>
                </div>
              </div>

              <div style={{ display:"flex", gap:20, marginBottom:16 }}>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:24, color:p.color }}>{platformLeads.length}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:10.5, color:C.muted }}>leads scraped</div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:24, color:"#22C55E" }}>{platformLeads.filter(l=>l._icpScore>=60).length}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:10.5, color:C.muted }}>high match</div>
                </div>
              </div>

              {isRunning ? (
                <div>
                  <div style={{ height:6, background:`${C.navy}12`, borderRadius:100, overflow:"hidden", marginBottom:10 }}>
                    <div style={{ height:"100%", width:jobStatus.total?`${(jobStatus.progress/jobStatus.total)*100}%`:"30%", background:p.color, borderRadius:100, transition:"width 0.5s", animation:jobStatus.total?"none":"pulse 1.5s infinite" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>Finding leads…</span>
                    <span style={{ fontFamily:"Fredoka One", fontSize:13, color:p.color }}>{jobStatus.leadsFound} found</span>
                  </div>
                  <button onClick={cancelJob} style={{ width:"100%", background:`${C.coral}12`, color:C.coral, border:`1px solid ${C.coral}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px", borderRadius:8 }}>Stop</button>
                </div>
              ) : (
                <button onClick={() => startScrape(p.id)} disabled={!serverOnline}
                  style={{ width:"100%", background:serverOnline?`linear-gradient(135deg,${p.color},${p.color}cc)`:`${C.navy}10`, color:serverOnline?"#fff":C.muted, border:"none", cursor:serverOnline?"pointer":"not-allowed", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px", borderRadius:10, transition:"opacity 0.2s" }}>
                  {serverOnline?"Find Leads Now":"Server Offline"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div style={{ background:C.white, borderRadius:14, padding:"20px 24px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ fontFamily:"Fredoka One", fontSize:16, color:"#1a1a2e", marginBottom:14 }}>How It Works</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {[
            { n:"1", t:"Start the server",   b:'Run "cd server && npm start" once. It runs in the background.' },
            { n:"2", t:"Log in once",         b:"First run opens a real browser. Log into Facebook/Instagram/LinkedIn normally. Sessions are saved." },
            { n:"3", t:"Define your ICP",     b:"Pick age range, location, Islamic commitment. The scraper targets relevant groups and hashtags automatically." },
            { n:"4", t:"Click Find Leads",    b:"The server searches public profiles that match your ICP and streams results back to this dashboard." },
            { n:"5", t:"Review & score",      b:"Every lead gets an ICP match score. Filter by score, inspect profile, send the best ones to CRM." },
            { n:"6", t:"Contact from CRM",    b:"Approved leads appear in Leads / CRM with WhatsApp, email and note-taking ready to go." },
          ].map(({ n, t, b }) => (
            <div key={n} style={{ background:"#F8F9FC", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy, marginBottom:4 }}>{n}</div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"#1a1a2e", marginBottom:4 }}>{t}</div>
              <p style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, lineHeight:1.6, margin:0 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // SCRAPER CONSOLE TAB
  // ══════════════════════════════════════════════════════════════════════
  const ScraperTab = () => (
    <div>
      {!activeJobId ? (
        <div style={{ background:C.white, borderRadius:14, padding:"60px 24px", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>🖥️</div>
          <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>No Active Job</div>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:20 }}>Go to Home and click "Find Leads Now" on any platform to start a scraping job.</p>
          <button onClick={() => setTab("home")} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"10px 24px", borderRadius:100 }}>← Back to Home</button>
        </div>
      ) : (
        <div>
          {/* Status header */}
          <div style={{ background:C.white, borderRadius:14, padding:"18px 22px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:PLATFORM_COLOR[jobStatus?.platform]||C.navy, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"Fredoka One", fontSize:14 }}>
                {PLATFORMS.find(p=>p.id===jobStatus?.platform)?.icon}
              </div>
              <div>
                <div style={{ fontFamily:"Fredoka One", fontSize:16, color:"#1a1a2e", textTransform:"capitalize" }}>{jobStatus?.platform} Scraper</div>
                <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, display:"flex", alignItems:"center" }}>
                  <StatusDot status={jobStatus?.status||"running"} />
                  {jobStatus?.status||"starting…"}
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:16, alignItems:"center" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"Fredoka One", fontSize:28, color:PLATFORM_COLOR[jobStatus?.platform]||C.navy }}>{jobStatus?.leadsFound||0}</div>
                <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted }}>leads found</div>
              </div>
              {running && (
                <button onClick={cancelJob} style={{ background:`${C.coral}12`, color:C.coral, border:`1px solid ${C.coral}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 18px", borderRadius:100 }}>Stop Job</button>
              )}
              {!running && <button onClick={() => setTab("pool")} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 18px", borderRadius:100 }}>View Lead Pool →</button>}
            </div>
          </div>

          {/* Progress bar */}
          {running && (
            <div style={{ background:C.white, borderRadius:12, padding:"14px 18px", marginBottom:16, boxShadow:"0 1px 6px rgba(0,0,0,0.05)" }}>
              <div style={{ height:8, background:`${C.navy}10`, borderRadius:100, overflow:"hidden" }}>
                <div style={{ height:"100%", width:jobStatus?.total?`${Math.min(100,(jobStatus.progress/jobStatus.total)*100)}%`:"20%", background:PLATFORM_COLOR[jobStatus?.platform]||C.navy, borderRadius:100, transition:"width 0.5s ease" }}/>
              </div>
              <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginTop:6 }}>
                {jobStatus?.total ? `${jobStatus.progress} / ${jobStatus.total} targets processed` : "Searching…"}
              </div>
            </div>
          )}

          {/* Live log */}
          <div style={{ background:"#0F1D3E", borderRadius:14, padding:"16px", boxShadow:"0 2px 12px rgba(0,0,0,0.15)", maxHeight:380, overflowY:"auto" }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Live Log</div>
            {(jobStatus?.logs||[]).map((entry, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:5 }}>
                <span style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.3)", whiteSpace:"nowrap", flexShrink:0 }}>
                  {new Date(entry.time).toLocaleTimeString()}
                </span>
                <span style={{ fontFamily:"monospace", fontSize:11.5, color:entry.msg.includes("ERROR")?"#ff6b6b":entry.msg.includes("done")||entry.msg.includes("found")?"#22C55E":"rgba(255,255,255,0.8)", lineHeight:1.5 }}>
                  {entry.msg}
                </span>
              </div>
            ))}
            {(jobStatus?.logs||[]).length === 0 && <span style={{ fontFamily:"monospace", fontSize:12, color:"rgba(255,255,255,0.3)" }}>Waiting for output…</span>}
            <div ref={logEndRef}/>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // LEAD POOL TAB
  // ══════════════════════════════════════════════════════════════════════
  const PoolTab = () => (
    <div>
      {/* Filters */}
      <div style={{ background:C.white, borderRadius:14, padding:"16px 20px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginBottom:16, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:6 }}>
          {["all","facebook","instagram","linkedin"].map(f => (
            <button key={f} onClick={() => setPoolFilter(f)} style={{ padding:"6px 14px", borderRadius:100, border:`1.5px solid ${poolFilter===f?C.navy:`${C.navy}18`}`, background:poolFilter===f?C.navy:"transparent", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:poolFilter===f?C.white:C.text, textTransform:"capitalize" }}>{f}</button>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
          <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>Min score:</span>
          <input type="range" min={0} max={90} step={10} value={scoreFilter} onChange={e=>setScoreFilter(Number(e.target.value))} style={{ accentColor:C.navy, width:90 }}/>
          <span style={{ fontFamily:"Fredoka One", fontSize:14, color:C.navy, minWidth:28 }}>{scoreFilter}%</span>
        </div>
        {visibleLeads.length>0 && (
          <button onClick={pushAllToCRM} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 16px", borderRadius:100 }}>
            Add All to CRM ({visibleLeads.filter(l=>!addedIds.has(l._id)).length})
          </button>
        )}
        {scrapedLeads.length > 0 && (
          <button onClick={() => { setScrapedLeads([]); lsSet("mmn_scraped_leads",[]); }} style={{ background:`${C.coral}12`, color:C.coral, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 14px", borderRadius:100 }}>Clear All</button>
        )}
      </div>

      {visibleLeads.length === 0 ? (
        <div style={{ background:C.white, borderRadius:14, padding:"60px 24px", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:48, marginBottom:14 }}>🔍</div>
          <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>
            {scrapedLeads.length===0 ? "No Leads Yet" : "No Leads Match This Filter"}
          </div>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted }}>
            {scrapedLeads.length===0 ? "Run a scrape job first — go to Home and click Find Leads on any platform." : "Lower the score threshold or change platform filter."}
          </p>
        </div>
      ) : (
        <div style={{ background:C.white, borderRadius:14, boxShadow:"0 2px 10px rgba(0,0,0,0.06)", overflow:"hidden" }}>
          <div style={{ padding:"12px 18px", borderBottom:`1px solid ${C.navy}08`, fontFamily:"Nunito", fontSize:12, color:C.muted }}>
            Showing {visibleLeads.length} leads · {visibleLeads.filter(l=>!addedIds.has(l._id)).length} not yet in CRM
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:`${C.navy}05` }}>
                  {["Score","Name","Platform","Bio / Headline","Location","Contact","Action"].map(h => (
                    <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:`1px solid ${C.navy}08`, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead, i) => (
                  <tr key={lead._id||i} style={{ borderBottom:`1px solid ${C.navy}05`, background:addedIds.has(lead._id)?`${C.mint}08`:i%2===0?"transparent":"#FAFBFF" }}>
                    <td style={{ padding:"11px 14px" }}><ScorePill score={lead._icpScore||0}/></td>
                    <td style={{ padding:"11px 14px" }}>
                      <a href={lead.profileUrl} target="_blank" rel="noreferrer" style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.navy, textDecoration:"none" }}>{lead.name||"—"}</a>
                      {lead.username && <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>@{lead.username}</div>}
                    </td>
                    <td style={{ padding:"11px 14px" }}><PlatformBadge platform={lead.platform}/></td>
                    <td style={{ padding:"11px 14px", maxWidth:220 }}>
                      <div style={{ fontFamily:"Nunito", fontSize:12, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:200 }}>{lead.bio||lead.headline||"—"}</div>
                    </td>
                    <td style={{ padding:"11px 14px", fontFamily:"Nunito", fontSize:12, color:C.muted, whiteSpace:"nowrap" }}>{lead.location||"—"}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.text }}>{lead.phone||lead.email||"—"}</div>
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      {addedIds.has(lead._id)
                        ? <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.mint }}>✓ In CRM</span>
                        : <button onClick={() => pushToCRM(lead)} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"6px 12px", borderRadius:8, whiteSpace:"nowrap" }}>Add to CRM</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // ICP EDITOR TAB
  // ══════════════════════════════════════════════════════════════════════
  const EditorTab = () => {
    if (editView) return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
          <button onClick={() => setEditView(false)} style={{ background:`${C.navy}10`, color:C.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 14px", borderRadius:100 }}>← Back</button>
          <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e" }}>{editId?"Edit ICP":"New ICP Profile"}</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:C.white, borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:16 }}>Profile Criteria</div>

            {[["ICP Name *", <input value={draft.name} onChange={e=>setF("name",e.target.value)} placeholder="e.g. DHA Islamic Mother" style={baseInput}/>],
              ["Description", <textarea value={draft.description||""} onChange={e=>setF("description",e.target.value)} placeholder="Short note…" style={{...baseInput,minHeight:60,resize:"vertical"}}/>],
              ["Child Age Range", <MultiChip options={AGE_RANGES} selected={draft.ageRanges} onChange={v=>setF("ageRanges",v)}/>],
              ["Islamic Commitment", <MultiChip options={COMMITMENT} selected={draft.commitment} onChange={v=>setF("commitment",v)}/>],
              ["Education Philosophy", <MultiChip options={PHILOSOPHY} selected={draft.philosophy} onChange={v=>setF("philosophy",v)}/>],
              ["Location", <MultiChip options={LOCATIONS} selected={draft.locations} onChange={v=>setF("locations",v)}/>],
            ].map(([label, input]) => (
              <div key={label} style={{ marginBottom:16 }}>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{label}</label>
                {input}
              </div>
            ))}
          </div>

          <div>
            <div style={{ background:C.white, borderRadius:16, padding:"22px 24px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginBottom:16 }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:16 }}>Custom Targets (Optional)</div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Facebook Group URLs (one per line)</label>
                <textarea value={(draft.customFbGroups||[]).join("\n")} onChange={e=>setF("customFbGroups",e.target.value.split("\n").filter(Boolean))} placeholder="https://facebook.com/groups/lahoreparents&#10;https://facebook.com/groups/dhalahoremoms" style={{...baseInput,minHeight:90,resize:"vertical",fontFamily:"monospace",fontSize:11}}/>
              </div>
              <div>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Custom Instagram Hashtags (one per line)</label>
                <textarea value={(draft.customIgHashtags||[]).join("\n")} onChange={e=>setF("customIgHashtags",e.target.value.split("\n").filter(Boolean))} placeholder="#lahoreislamicmoms&#10;#dhaparents" style={{...baseInput,minHeight:90,resize:"vertical",fontFamily:"monospace",fontSize:11}}/>
              </div>
            </div>

            <div style={{ background:`${C.navy}06`, borderRadius:14, padding:"16px 18px" }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:14, color:"#1a1a2e", marginBottom:8 }}>Scoring Weights</div>
              {[["Location match","20"],["Islamic keywords in bio","20"],["Parenting keywords","15"],["Education philosophy","10"],["Contact info available","10"],["Appeared in targeted search","30 (base)"]].map(([l,w])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontFamily:"Nunito", fontSize:12, color:C.text }}>{l}</span>
                  <span style={{ fontFamily:"Fredoka One", fontSize:12, color:C.navy }}>+{w}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          <button onClick={saveICP} disabled={!draft.name.trim()} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:draft.name.trim()?"pointer":"not-allowed", opacity:draft.name.trim()?1:0.5, fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px 32px", borderRadius:100 }}>
            {editId?"Save Changes":"Create ICP"}
          </button>
          <button onClick={() => setEditView(false)} style={{ background:C.warmGray, color:C.muted, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px 24px", borderRadius:100 }}>Cancel</button>
        </div>
      </div>
    );

    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e" }}>ICP Profiles</div>
          <button onClick={openNew} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"9px 20px", borderRadius:100 }}>+ New ICP</button>
        </div>

        {icps.length===0 ? (
          <div style={{ background:C.white, borderRadius:14, padding:"60px 24px", textAlign:"center", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:48, marginBottom:14 }}>🎯</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>No ICPs Yet</div>
            <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, maxWidth:360, margin:"0 auto 20px" }}>Define your ideal family profile so the scraper knows exactly who to look for.</p>
            <button onClick={openNew} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px 28px", borderRadius:100 }}>Create First ICP</button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
            {icps.map(icp => (
              <div key={icp.id} style={{ background:C.white, borderRadius:14, padding:"20px 20px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e", marginBottom:6 }}>{icp.name}</div>
                {icp.description && <p style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, margin:"0 0 12px", lineHeight:1.5 }}>{icp.description}</p>}
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:14 }}>
                  {[...(icp.ageRanges||[]),...(icp.locations||[]),...(icp.philosophy||[])].slice(0,5).map((t,i) => (
                    <span key={i} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, background:`${C.navy}10`, color:C.navy, padding:"2px 8px", borderRadius:100 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setSelectedIcp(icp); setTab("home"); }} style={{ flex:1, background:`${C.mint}18`, color:C.mint, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px", borderRadius:8 }}>Use for Scraping</button>
                  <button onClick={() => openEdit(icp)} style={{ background:`${C.navy}10`, color:C.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 14px", borderRadius:8 }}>Edit</button>
                  <button onClick={() => setConfirmDel(icp.id)} style={{ background:`${C.coral}12`, color:C.coral, border:"none", cursor:"pointer", fontFamily:"Nunito", fontSize:13, padding:"8px 10px", borderRadius:8 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmDel && (
          <>
            <div onClick={() => setConfirmDel(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
            <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(340px,90vw)", zIndex:401, textAlign:"center" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🎯</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e", marginBottom:8 }}>Delete this ICP?</div>
              <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, marginBottom:22 }}>This cannot be undone.</p>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => { deleteICP(confirmDel); setConfirmDel(null); if (selectedIcp?.id===confirmDel) setSelectedIcp(null); }} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Delete</button>
                <button onClick={() => setConfirmDel(null)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Social Lead Generation</h2>
        <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Scrapes Facebook groups, Instagram hashtags, and LinkedIn to find real leads matching your ICP — fully automated.</p>
      </div>

      <TabBar />

      {tab==="home"    && <HomeTab />}
      {tab==="scraper" && <ScraperTab />}
      {tab==="pool"    && <PoolTab />}
      {tab==="editor"  && <EditorTab />}
    </div>
  );
}
