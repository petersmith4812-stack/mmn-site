import { useState } from "react";
import { C } from "../../../constants/theme";
import { useAdmin, LEAD_STAGES } from "../../../context/AdminContext";

const TYPES = [
  { id:"whatsapp", label:"WhatsApp Blast", icon:"💬", color:"#25D366" },
  { id:"email",    label:"Email Campaign", icon:"📧", color:C.navy    },
  { id:"social",   label:"Social Media",   icon:"📱", color:"#6C63FF" },
  { id:"sms",      label:"SMS",            icon:"📨", color:C.coral   },
];

const STATUS_COLORS = { draft:C.muted, active:C.mint, paused:C.yellow, completed:"#22C55E", archived:"#aaa" };
const STATUS_LABELS = { draft:"Draft", active:"Active", paused:"Paused", completed:"Completed", archived:"Archived" };

const WA_TEMPLATES = [
  { title:"Initial Enquiry Follow-up", body:`As-salamu Alaykum [Name]! 🌸\n\nJazakAllah Khair for your interest in Mini Muslims Nest.\n\nWe'd love to have a conversation about your child and whether MMN is the right fit for your family.\n\nWould you like to book a short visit this week?\n\nYou can reply to this message or call us at [number].\n\nBarak Allahu Feekum 🤲` },
  { title:"Visit Reminder", body:`As-salamu Alaykum [Name]!\n\nThis is a gentle reminder that your visit to Mini Muslims Nest is confirmed for [Date] at [Time].\n\n📍 Address: [Address]\n\nWe look forward to meeting you and your family, in sha Allah.\n\nPlease let us know if you need to reschedule.\n\nBarak Allahu Feekum 🕌` },
  { title:"Enrollment Offer", body:`As-salamu Alaykum [Name]!\n\nWe were so happy to meet your family! 🌸\n\nAfter our conversation, we'd love to welcome [Child's name] to Mini Muslims Nest, in sha Allah.\n\nWe have a spot available for the upcoming term starting [Date].\n\nShall we proceed with enrollment? We can arrange a brief call to go through the next steps.\n\nBarak Allahu Feekum 🤲` },
  { title:"Cold Lead Re-engagement", body:`As-salamu Alaykum!\n\nIt's been a while since we spoke about Mini Muslims Nest. 💛\n\nWe wanted to reach out because we have a few spots opening up for our next term.\n\nIf you're still looking for an Islamic, child-led, mother-present school for your little one — we'd love to reconnect.\n\nWould a 15-min call work this week?\n\nBarak Allahu Feekum 🌸` },
];

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : "—";

export default function DashCampaigns() {
  const { campaigns, leads, addCampaign, updateCampaign, deleteCampaign } = useAdmin();
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [new_, setNew_] = useState({ title:"", type:"whatsapp", targetSegment:"all", content:"", notes:"" });

  const filtered = campaigns.filter(c => filterType==="all" || c.type===filterType)
    .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const detail = showDetail ? campaigns.find(c=>c.id===showDetail) : null;

  const segmentCount = (seg) => {
    if (seg==="all") return leads.length;
    const stage = LEAD_STAGES.find(s=>s.id===seg);
    return stage ? leads.filter(l=>l.status===seg).length : leads.length;
  };

  const doCreate = () => {
    if (!new_.title) return;
    addCampaign(new_);
    setNew_({ title:"", type:"whatsapp", targetSegment:"all", content:"", notes:"" });
    setShowCreate(false);
  };

  const applyTemplate = (tpl) => setNew_(p=>({...p,content:tpl.body}));

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Campaigns</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Plan, draft, and track your outreach campaigns.</p>
        </div>
        <button onClick={()=>setShowCreate(true)} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 22px", borderRadius:100, boxShadow:`0 4px 14px ${C.navy}35` }}>+ New Campaign</button>
      </div>

      {/* Type filter tabs */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
        {[{id:"all",label:"All",icon:"📊",color:C.navy},{...TYPES[0]},{...TYPES[1]},{...TYPES[2]},{...TYPES[3]}].map(t => (
          <button key={t.id} onClick={()=>setFilterType(t.id)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:100, border:`1.5px solid ${filterType===t.id?t.color:`${C.navy}15`}`, background:filterType===t.id?`${t.color}12`:C.white, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12.5, color:filterType===t.id?t.color:C.muted, transition:"all 0.15s" }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background:C.white, borderRadius:18, padding:"64px 24px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>📣</div>
          <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>No campaigns yet</div>
          <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, maxWidth:360, margin:"0 auto 20px" }}>Create your first campaign to plan and track your outreach.</p>
          <button onClick={()=>setShowCreate(true)} style={{ background:C.navy, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"11px 24px", borderRadius:100 }}>Create Campaign</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {filtered.map(camp => {
            const type = TYPES.find(t=>t.id===camp.type)||TYPES[0];
            const statusColor = STATUS_COLORS[camp.status]||C.muted;
            return (
              <div key={camp.id} onClick={()=>setShowDetail(camp.id)} style={{ background:C.white, borderRadius:18, padding:"20px 22px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", cursor:"pointer", border:`1.5px solid ${type.color}18`, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.1)";e.currentTarget.style.borderColor=`${type.color}40`;}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.06)";e.currentTarget.style.borderColor=`${type.color}18`;}}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${type.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{type.icon}</div>
                    <div>
                      <div style={{ fontFamily:"Nunito", fontWeight:800, fontSize:12.5, color:type.color }}>{type.label}</div>
                      <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{fmt(camp.createdAt)}</div>
                    </div>
                  </div>
                  <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", background:`${statusColor}18`, color:statusColor, padding:"3px 10px", borderRadius:100 }}>{STATUS_LABELS[camp.status]||camp.status}</span>
                </div>
                <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e", marginBottom:6 }}>{camp.title}</div>
                {camp.content && <p style={{ fontFamily:"Nunito", fontSize:12.5, color:C.muted, lineHeight:1.55, margin:"0 0 12px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{camp.content}</p>}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>
                    {segmentCount(camp.targetSegment)} {camp.targetSegment==="all"?"total leads":"in segment"}
                  </span>
                  <div style={{ display:"flex", gap:6 }}>
                    {["draft","active","paused","completed"].filter(s=>s!==camp.status).slice(0,1).map(s=>(
                      <button key={s} onClick={e=>{e.stopPropagation();updateCampaign(camp.id,{status:s});}} style={{ background:`${STATUS_COLORS[s]}12`, color:STATUS_COLORS[s], border:`1px solid ${STATUS_COLORS[s]}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"4px 10px", borderRadius:100 }}>→ {STATUS_LABELS[s]}</button>
                    ))}
                    <button onClick={e=>{e.stopPropagation();setConfirmDel(camp.id);}} style={{ background:`${C.coral}10`, color:C.coral, border:`1px solid ${C.coral}25`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"4px 8px", borderRadius:100 }}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CAMPAIGN DETAIL */}
      {detail && (
        <>
          <div onClick={()=>setShowDetail(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:300 }}/>
          <div style={{ position:"fixed", right:0, top:0, bottom:0, width:"min(560px,100vw)", background:C.white, zIndex:301, display:"flex", flexDirection:"column", boxShadow:"-8px 0 40px rgba(0,0,0,0.15)", overflowY:"auto" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.navy}10`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e" }}>{detail.title}</div>
              <button onClick={()=>setShowDetail(null)} style={{ background:`${C.navy}10`, border:"none", cursor:"pointer", width:34, height:34, borderRadius:"50%", fontSize:16, color:C.muted }}>✕</button>
            </div>
            <div style={{ flex:1, padding:"24px" }}>
              <div style={{ display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" }}>
                {["draft","active","paused","completed"].map(s=>(
                  <button key={s} onClick={()=>updateCampaign(detail.id,{status:s})} style={{ padding:"7px 16px", borderRadius:100, border:`1.5px solid ${detail.status===s?STATUS_COLORS[s]:`${C.navy}15`}`, background:detail.status===s?`${STATUS_COLORS[s]}18`:C.white, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:detail.status===s?STATUS_COLORS[s]:C.muted, transition:"all 0.15s" }}>{STATUS_LABELS[s]}</button>
                ))}
              </div>
              <div style={{ background:"#F8F9FC", borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Campaign Content</div>
                <pre style={{ fontFamily:"Nunito", fontSize:13, color:C.text, lineHeight:1.7, whiteSpace:"pre-wrap", margin:0 }}>{detail.content||"No content yet."}</pre>
              </div>
              {detail.notes && (
                <div style={{ background:"#F8F9FC", borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
                  <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Notes</div>
                  <p style={{ fontFamily:"Nunito", fontSize:13, color:C.text, lineHeight:1.7, margin:0 }}>{detail.notes}</p>
                </div>
              )}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ background:"#F8F9FC", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:28, color:C.navy }}>{segmentCount(detail.targetSegment)}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>Target Leads</div>
                </div>
                <div style={{ background:"#F8F9FC", borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
                  <div style={{ fontFamily:"Fredoka One", fontSize:28, color:C.mint }}>{fmt(detail.createdAt)}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>Created</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <>
          <div onClick={()=>setShowCreate(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:300 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:22, padding:"32px 28px", width:"min(600px,95vw)", zIndex:301, boxShadow:"0 24px 80px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", marginBottom:20 }}>New Campaign</div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Campaign Title *</label>
              <input value={new_.title} onChange={e=>setNew_(p=>({...p,title:e.target.value}))} placeholder="e.g. New Term Enrollment Drive" style={baseInput} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
              <div>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Type</label>
                <select value={new_.type} onChange={e=>setNew_(p=>({...p,type:e.target.value}))} style={{ ...baseInput, cursor:"pointer" }}>
                  {TYPES.map(t=><option key={t.id} value={t.id}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Target Segment</label>
                <select value={new_.targetSegment} onChange={e=>setNew_(p=>({...p,targetSegment:e.target.value}))} style={{ ...baseInput, cursor:"pointer" }}>
                  <option value="all">All Leads ({leads.length})</option>
                  {LEAD_STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label} ({leads.filter(l=>l.status===s.id).length})</option>)}
                </select>
              </div>
            </div>

            {/* WhatsApp templates */}
            {new_.type === "whatsapp" && (
              <div style={{ marginBottom:14 }}>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Templates (click to use)</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:8 }}>
                  {WA_TEMPLATES.map(tpl=>(
                    <button key={tpl.title} onClick={()=>applyTemplate(tpl)} style={{ background:`${C.mint}10`, border:`1px solid ${C.mint}30`, borderRadius:10, padding:"10px 12px", cursor:"pointer", textAlign:"left" }}>
                      <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy }}>{tpl.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom:14 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Message / Content</label>
              <textarea value={new_.content} onChange={e=>setNew_(p=>({...p,content:e.target.value}))} placeholder="Write your campaign message here. Use [Name], [Date] as placeholders." style={{ ...baseInput, minHeight:140, resize:"vertical" }} />
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Internal Notes</label>
              <textarea value={new_.notes} onChange={e=>setNew_(p=>({...p,notes:e.target.value}))} placeholder="Goals, strategy notes, budget…" style={{ ...baseInput, minHeight:60, resize:"vertical" }} />
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={doCreate} disabled={!new_.title} style={{ flex:1, background:new_.title?`linear-gradient(135deg,${C.navy},#2d51b8)`:C.muted, color:C.white, border:"none", cursor:new_.title?"pointer":"default", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"13px", borderRadius:100 }}>Create Campaign</button>
              <button onClick={()=>setShowCreate(false)} style={{ flex:1, background:C.warmGray, color:C.muted, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"13px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {confirmDel && (
        <>
          <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(360px,90vw)", zIndex:401, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>Delete campaign?</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{deleteCampaign(confirmDel);setConfirmDel(null);}} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Delete</button>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
