import { useState } from "react";
import { C } from "../../../constants/theme";
import { useAdmin, LEAD_STAGES } from "../../../context/AdminContext";

const PRIORITY_OPTS = ["high","medium","low"];
const PRIORITY_COLOR = { high:C.coral, medium:"#F5A623", low:C.mint };
const SOURCE_COLOR   = { "contact-form":C.navy, "exit-popup":C.coral, manual:C.mint };

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"}) : "—";
const fmtFull = (iso) => iso ? new Date(iso).toLocaleString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) : "—";

const exportCSV = (leads) => {
  const h = ["Name","Email","Phone","Subject","Message","Source","Status","Priority","Date"];
  const rows = leads.map(l => [l.name,l.email,l.phone,l.subject||l.message?.slice(0,30),l.message,l.source,l.status,l.priority,l.createdAt]);
  const csv  = [h,...rows].map(r=>r.map(v=>`"${(v||"").replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`leads-${Date.now()}.csv`; a.click();
};

const Badge = ({ text, color }) => (
  <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", background:`${color}18`, color, padding:"3px 9px", borderRadius:100, whiteSpace:"nowrap" }}>{text}</span>
);

export default function DashLeads() {
  const { leads, users, updateLead, deleteLead, addLead, addActivity } = useAdmin();
  const [view,     setView]     = useState("list");   // "list" | "pipeline"
  const [search,   setSearch]   = useState("");
  const [filterSt, setFilterSt] = useState("all");
  const [filterPr, setFilterPr] = useState("all");
  const [selected, setSelected] = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [note,     setNote]     = useState("");
  const [newLead,  setNewLead]  = useState({ name:"",email:"",phone:"",source:"manual",message:"" });
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || [l.name,l.email,l.phone,l.message].some(v=>(v||"").toLowerCase().includes(q));
    const matchSt = filterSt==="all" || l.status===filterSt;
    const matchPr = filterPr==="all" || l.priority===filterPr;
    return matchSearch && matchSt && matchPr;
  }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const sel = selected ? leads.find(l=>l.id===selected) : null;

  const addNote = () => {
    if (!note.trim()) return;
    addActivity(selected, { type:"note", text:note });
    setNote("");
  };

  const doAddLead = () => {
    if (!newLead.name) return;
    addLead(newLead);
    setNewLead({ name:"",email:"",phone:"",source:"manual",message:"" });
    setShowAdd(false);
  };

  const baseInput = { width:"100%", padding:"10px 12px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };
  const selectStyle = { ...baseInput, cursor:"pointer" };

  return (
    <div style={{ position:"relative" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 2px" }}>Leads & CRM</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>{leads.length} total leads</p>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <button onClick={()=>setShowAdd(true)} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 20px", borderRadius:100, boxShadow:`0 4px 14px ${C.navy}35` }}>+ Add Lead</button>
          <button onClick={()=>exportCSV(filtered)} style={{ background:C.white, color:C.navy, border:`1.5px solid ${C.navy}25`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"10px 18px", borderRadius:100 }}>⬇ Export CSV</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:C.white, borderRadius:14, padding:"14px 18px", marginBottom:16, boxShadow:"0 1px 6px rgba(0,0,0,0.05)", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <input placeholder="🔍  Search by name, email, phone…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{ ...baseInput, flex:1, minWidth:180, padding:"9px 14px" }} />
        <select value={filterSt} onChange={e=>setFilterSt(e.target.value)} style={{ ...selectStyle, width:"auto", minWidth:140 }}>
          <option value="all">All Stages</option>
          {LEAD_STAGES.map(s=><option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
        </select>
        <select value={filterPr} onChange={e=>setFilterPr(e.target.value)} style={{ ...selectStyle, width:"auto", minWidth:120 }}>
          <option value="all">All Priority</option>
          {PRIORITY_OPTS.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <div style={{ display:"flex", border:`1.5px solid ${C.navy}18`, borderRadius:10, overflow:"hidden" }}>
          {["list","pipeline"].map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{ padding:"8px 14px", border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, background:view===v?C.navy:"transparent", color:view===v?C.white:C.muted, transition:"all 0.15s" }}>
              {v==="list" ? "≡ List" : "⧉ Pipeline"}
            </button>
          ))}
        </div>
      </div>

      {/* LIST VIEW */}
      {view==="list" && (
        <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
          {filtered.length===0 ? (
            <div style={{ padding:"48px 24px", textAlign:"center", color:C.muted, fontFamily:"Nunito", fontSize:14 }}>No leads found. {leads.length===0 ? "Leads from contact forms appear here automatically." : "Try adjusting your filters."}</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:680 }}>
                <thead style={{ background:"#F8F9FC" }}>
                  <tr>
                    {["Lead","Contact","Source","Stage","Priority","Date","Actions"].map(h=>(
                      <th key={h} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textAlign:"left", padding:"12px 16px", textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:`1px solid ${C.navy}10` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => {
                    const stage = LEAD_STAGES.find(s=>s.id===l.status)||LEAD_STAGES[0];
                    return (
                      <tr key={l.id} onClick={()=>setSelected(l.id)} style={{ cursor:"pointer", borderBottom:`1px solid ${C.navy}08`, transition:"background 0.12s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#F9FAFB"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color:"#1a1a2e" }}>{l.name||"—"}</div>
                          <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted, marginTop:2 }}>{l.email||""}</div>
                        </td>
                        <td style={{ padding:"13px 16px", fontFamily:"Nunito", fontSize:13, color:C.text }}>{l.phone||"—"}</td>
                        <td style={{ padding:"13px 16px" }}><Badge text={l.source||"form"} color={SOURCE_COLOR[l.source]||C.navy} /></td>
                        <td style={{ padding:"13px 16px" }}><Badge text={`${stage.icon} ${stage.label}`} color={stage.color} /></td>
                        <td style={{ padding:"13px 16px" }}><Badge text={l.priority||"medium"} color={PRIORITY_COLOR[l.priority]||C.muted} /></td>
                        <td style={{ padding:"13px 16px", fontFamily:"Nunito", fontSize:12, color:C.muted, whiteSpace:"nowrap" }}>{fmt(l.createdAt)}</td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex", gap:6 }}>
                            {l.phone && <a href={`https://wa.me/${l.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:16, textDecoration:"none", lineHeight:1 }} title="WhatsApp">💬</a>}
                            {l.email && <a href={`mailto:${l.email}`} onClick={e=>e.stopPropagation()} style={{ fontSize:16, textDecoration:"none", lineHeight:1 }} title="Email">📧</a>}
                            <button onClick={e=>{e.stopPropagation();setConfirmDel(l.id);}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:C.coral, padding:0 }} title="Delete">🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PIPELINE VIEW */}
      {view==="pipeline" && (
        <div style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:12 }}>
          {LEAD_STAGES.map(stage => {
            const stageLeads = filtered.filter(l=>l.status===stage.id);
            return (
              <div key={stage.id} style={{ minWidth:230, background:C.white, borderRadius:16, padding:"14px 12px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", border:`2px solid ${stage.color}20`, flexShrink:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:12 }}>
                  <span style={{ fontSize:16 }}>{stage.icon}</span>
                  <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:12, color:stage.color, textTransform:"uppercase", letterSpacing:"0.07em" }}>{stage.label}</span>
                  <span style={{ marginLeft:"auto", fontFamily:"Fredoka One", fontSize:16, color:stage.color }}>{stageLeads.length}</span>
                </div>
                {stageLeads.length===0 ? (
                  <div style={{ padding:"20px 0", textAlign:"center", fontFamily:"Nunito", fontSize:12, color:C.muted, borderTop:`1px dashed ${stage.color}30` }}>Empty</div>
                ) : stageLeads.map(l=>(
                  <div key={l.id} onClick={()=>setSelected(l.id)} style={{ background:"#F9FAFB", borderRadius:12, padding:"12px 12px", marginBottom:8, cursor:"pointer", border:`1.5px solid ${stage.color}15`, transition:"all 0.15s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=`${stage.color}08`; e.currentTarget.style.borderColor=`${stage.color}40`; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="#F9FAFB"; e.currentTarget.style.borderColor=`${stage.color}15`; }}
                  >
                    <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"#1a1a2e", marginBottom:4 }}>{l.name||"Unknown"}</div>
                    <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted, marginBottom:6 }}>{l.phone||l.email||"—"}</div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <Badge text={l.priority||"medium"} color={PRIORITY_COLOR[l.priority||"medium"]} />
                      <span style={{ fontFamily:"Nunito", fontSize:10.5, color:C.muted }}>{fmt(l.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* LEAD DETAIL PANEL */}
      {sel && (
        <>
          <div onClick={()=>setSelected(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:300 }}/>
          <div style={{ position:"fixed", right:0, top:0, bottom:0, width:"min(520px,100vw)", background:C.white, zIndex:301, display:"flex", flexDirection:"column", boxShadow:"-8px 0 40px rgba(0,0,0,0.15)", overflow:"hidden" }}>
            {/* Panel header */}
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.navy}10`, display:"flex", alignItems:"center", justifyContent:"space-between", background:`linear-gradient(135deg,${C.navy}08,${C.coral}06)` }}>
              <div>
                <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e" }}>{sel.name||"Unknown Lead"}</div>
                <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:2 }}>{fmtFull(sel.createdAt)}</div>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:`${C.navy}10`, border:"none", cursor:"pointer", width:34, height:34, borderRadius:"50%", fontSize:16, color:C.muted, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
              {/* Contact info */}
              <div style={{ background:"#F8F9FC", borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Contact Info</div>
                {[["📧","Email",sel.email,"mailto:"+sel.email],["📞","Phone",sel.phone,sel.phone?`tel:${sel.phone}`:null],["📍","Location",sel.location,null]].map(([icon,lbl,val,href])=>val?(
                  <div key={lbl} style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:15, width:20 }}>{icon}</span>
                    <div>
                      <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{lbl}</div>
                      {href ? <a href={href} style={{ fontFamily:"Nunito", fontWeight:600, fontSize:13, color:C.navy, textDecoration:"none" }}>{val}</a>
                             : <div style={{ fontFamily:"Nunito", fontWeight:600, fontSize:13, color:"#1a1a2e" }}>{val}</div>}
                    </div>
                  </div>
                ):null)}
              </div>

              {/* Status & Priority */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
                {[
                  { label:"Stage", key:"status", opts:LEAD_STAGES.map(s=>({v:s.id,l:`${s.icon} ${s.label}`})) },
                  { label:"Priority", key:"priority", opts:PRIORITY_OPTS.map(p=>({v:p,l:p})) },
                  { label:"Assign To", key:"assignedTo", opts:[{v:null,l:"Unassigned"},...users.map(u=>({v:u.id,l:u.name}))] },
                ].map(({ label, key, opts }) => (
                  <div key={key}>
                    <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>{label}</label>
                    <select value={sel[key]||""} onChange={e=>updateLead(sel.id,{[key]:e.target.value||null})} style={{ ...baseInput, padding:"8px 10px", fontSize:12 }}>
                      {opts.map(({v,l})=><option key={v} value={v||""}>{l}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Message */}
              {sel.message && (
                <div style={{ background:"#F8F9FC", borderRadius:12, padding:"14px 16px", marginBottom:18 }}>
                  <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Message</div>
                  <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.7, margin:0 }}>{sel.message}</p>
                </div>
              )}

              {/* Activity history */}
              <div style={{ marginBottom:18 }}>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Activity Timeline</div>
                {(sel.contactHistory||[]).length===0 ? (
                  <div style={{ fontFamily:"Nunito", fontSize:12.5, color:C.muted, fontStyle:"italic" }}>No activity yet.</div>
                ) : [...(sel.contactHistory||[])].reverse().map(e=>(
                  <div key={e.id} style={{ display:"flex", gap:10, marginBottom:10 }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", background:`${C.navy}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{e.type==="note"?"📝":e.type==="whatsapp"?"💬":"📧"}</div>
                    <div>
                      <div style={{ fontFamily:"Nunito", fontSize:13, color:C.text, lineHeight:1.55 }}>{e.text}</div>
                      <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginTop:2 }}>{fmtFull(e.date)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add note */}
              <div style={{ background:"#F8F9FC", borderRadius:12, padding:"14px 16px" }}>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Add Note / Log</div>
                <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a note, log a call, or record what happened…"
                  style={{ ...baseInput, minHeight:72, resize:"vertical", marginBottom:8 }} />
                <button onClick={addNote} disabled={!note.trim()} style={{ background:note.trim()?C.navy:C.muted, color:C.white, border:"none", cursor:note.trim()?"pointer":"default", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 18px", borderRadius:100 }}>Save Note</button>
              </div>
            </div>

            {/* Panel footer: contact buttons */}
            <div style={{ padding:"14px 24px", borderTop:`1px solid ${C.navy}10`, display:"flex", gap:10, flexWrap:"wrap" }}>
              {sel.phone && <a href={`https://wa.me/${sel.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ flex:1, minWidth:120, background:"#25D366", color:C.white, textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"11px 12px", borderRadius:100, textAlign:"center" }}>💬 WhatsApp</a>}
              {sel.email && <a href={`mailto:${sel.email}`} style={{ flex:1, minWidth:120, background:C.navy, color:C.white, textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"11px 12px", borderRadius:100, textAlign:"center" }}>📧 Email</a>}
              <button onClick={()=>{setConfirmDel(sel.id); setSelected(null);}} style={{ background:`${C.coral}15`, color:C.coral, border:`1.5px solid ${C.coral}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"11px 14px", borderRadius:100 }}>🗑</button>
            </div>
          </div>
        </>
      )}

      {/* ADD LEAD MODAL */}
      {showAdd && (
        <>
          <div onClick={()=>setShowAdd(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:300 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:22, padding:"36px 32px", width:"min(480px,95vw)", zIndex:301, boxShadow:"0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", marginBottom:20 }}>Add Lead Manually</div>
            {[
              { label:"Full Name *", key:"name", type:"text", ph:"Contact name" },
              { label:"Phone / WhatsApp", key:"phone", type:"tel", ph:"+92 300 000 0000" },
              { label:"Email Address", key:"email", type:"email", ph:"email@example.com" },
            ].map(({ label, key, type, ph }) => (
              <div key={key} style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>{label}</label>
                <input type={type} value={newLead[key]} onChange={e=>setNewLead(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={baseInput} />
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Message / Note</label>
              <textarea value={newLead.message} onChange={e=>setNewLead(p=>({...p,message:e.target.value}))} placeholder="Any initial notes…" style={{ ...baseInput, minHeight:70, resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={doAddLead} disabled={!newLead.name} style={{ flex:1, background:newLead.name?`linear-gradient(135deg,${C.navy},#2d51b8)`:C.muted, color:C.white, border:"none", cursor:newLead.name?"pointer":"default", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"13px", borderRadius:100 }}>Add Lead</button>
              <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:"transparent", color:C.muted, border:`1.5px solid ${C.navy}20`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"13px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <>
          <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(380px,90vw)", zIndex:401, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>Delete this lead?</div>
            <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, marginBottom:24 }}>This cannot be undone.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{deleteLead(confirmDel);setConfirmDel(null);}} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Yes, Delete</button>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
