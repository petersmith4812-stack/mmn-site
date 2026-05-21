import { useState } from "react";
import { C } from "../../../constants/theme";
import { useAdmin } from "../../../context/AdminContext";

export default function DashPages() {
  const { pages, updatePage, addPage, deletePage, reorderPages } = useAdmin();
  const [showAdd, setShowAdd] = useState(false);
  const [newPage, setNewPage] = useState({ title:"", slug:"", description:"" });
  const [confirmDel, setConfirmDel] = useState(null);
  const [saved, setSaved] = useState(false);

  const sorted = [...pages].sort((a,b) => a.navOrder - b.navOrder);

  const moveUp = (id) => {
    const idx = sorted.findIndex(p=>p.id===id);
    if (idx === 0) return;
    const arr = [...sorted];
    [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
    reorderPages(arr.map((p,i)=>({...p,navOrder:i+1})));
  };

  const moveDown = (id) => {
    const idx = sorted.findIndex(p=>p.id===id);
    if (idx === sorted.length-1) return;
    const arr = [...sorted];
    [arr[idx], arr[idx+1]] = [arr[idx+1], arr[idx]];
    reorderPages(arr.map((p,i)=>({...p,navOrder:i+1})));
  };

  const doAddPage = () => {
    if (!newPage.title || !newPage.slug) return;
    const slug = newPage.slug.startsWith("/") ? newPage.slug : "/" + newPage.slug;
    addPage({ ...newPage, slug, visible:true });
    setNewPage({ title:"", slug:"", description:"" });
    setShowAdd(false);
    setSaved(true); setTimeout(()=>setSaved(false), 2000);
  };

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Page Manager</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Show or hide pages, reorder navigation, add custom pages.</p>
        </div>
        <button onClick={()=>setShowAdd(true)} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 22px", borderRadius:100, boxShadow:`0 4px 14px ${C.navy}35` }}>+ Add Page</button>
      </div>

      {saved && (
        <div style={{ background:`${C.mint}18`, border:`1.5px solid ${C.mint}40`, borderRadius:12, padding:"12px 16px", marginBottom:16, fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.mint }}>✓ Page added successfully.</div>
      )}

      <div style={{ background:C.white, borderRadius:18, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", overflow:"hidden" }}>
        <div style={{ padding:"14px 22px", borderBottom:`1px solid ${C.navy}08`, display:"grid", gridTemplateColumns:"36px 1fr 100px 80px 80px 80px", gap:12, alignItems:"center" }}>
          {["Order","Page / Slug","Visible","Move","Edit",""].map((h,i) => (
            <div key={i} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>{h}</div>
          ))}
        </div>

        {sorted.map((page, idx) => (
          <div key={page.id} style={{ padding:"14px 22px", borderBottom:`1px solid ${C.navy}06`, display:"grid", gridTemplateColumns:"36px 1fr 100px 80px 80px 80px", gap:12, alignItems:"center", background: page.visible ? C.white : "#FAFAFA" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.muted, textAlign:"center" }}>{idx+1}</div>
            <div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color:"#1a1a2e", display:"flex", alignItems:"center", gap:8 }}>
                {page.title}
                {page.custom && <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:C.coral, background:`${C.coral}15`, padding:"2px 8px", borderRadius:100 }}>Custom</span>}
              </div>
              <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted, marginTop:2 }}>{page.slug}</div>
            </div>

            {/* Visible toggle */}
            <div>
              <button onClick={()=>updatePage(page.id,{visible:!page.visible})} style={{ width:44, height:24, borderRadius:100, border:"none", cursor:"pointer", background:page.visible?C.mint:`${C.navy}25`, position:"relative", transition:"background 0.25s", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left:page.visible?22:3, width:18, height:18, borderRadius:"50%", background:C.white, transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
              </button>
              <span style={{ fontFamily:"Nunito", fontSize:11, color:page.visible?C.mint:C.muted, marginLeft:8 }}>{page.visible?"On":"Off"}</span>
            </div>

            {/* Move */}
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={()=>moveUp(page.id)} disabled={idx===0} style={{ background:idx===0?"#F0F0F0":C.warmGray, border:"none", cursor:idx===0?"default":"pointer", width:28, height:28, borderRadius:8, fontSize:14, color:idx===0?C.muted:C.navy }}>↑</button>
              <button onClick={()=>moveDown(page.id)} disabled={idx===sorted.length-1} style={{ background:idx===sorted.length-1?"#F0F0F0":C.warmGray, border:"none", cursor:idx===sorted.length-1?"default":"pointer", width:28, height:28, borderRadius:8, fontSize:14, color:idx===sorted.length-1?C.muted:C.navy }}>↓</button>
            </div>

            {/* View */}
            <div>
              <button onClick={()=>window.open(page.slug,"_blank")} style={{ background:C.warmGray, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11.5, color:C.navy, padding:"6px 12px", borderRadius:8 }}>↗ View</button>
            </div>

            {/* Delete (custom only) */}
            <div>
              {page.custom && (
                <button onClick={()=>setConfirmDel(page.id)} style={{ background:`${C.coral}12`, border:`1px solid ${C.coral}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11.5, color:C.coral, padding:"6px 10px", borderRadius:8 }}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:16, padding:"14px 18px", background:`${C.yellow}15`, border:`1.5px solid ${C.yellow}40`, borderRadius:12 }}>
        <p style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12.5, color:"#7B6200", margin:0 }}>
          💡 Built-in pages (Home, About, etc.) cannot be deleted — only hidden. Custom pages you add can be removed. Nav order changes take effect immediately.
        </p>
      </div>

      {/* ADD PAGE MODAL */}
      {showAdd && (
        <>
          <div onClick={()=>setShowAdd(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:300 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:22, padding:"36px 32px", width:"min(460px,95vw)", zIndex:301, boxShadow:"0 24px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", marginBottom:20 }}>Add Custom Page</div>
            {[
              { label:"Page Title *", key:"title", ph:"e.g. Gallery" },
              { label:"URL Slug *",   key:"slug",  ph:"/gallery" },
            ].map(({ label, key, ph }) => (
              <div key={key} style={{ marginBottom:14 }}>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>{label}</label>
                <input type="text" value={newPage[key]} onChange={e=>setNewPage(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={baseInput} />
              </div>
            ))}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:5 }}>Description (optional)</label>
              <textarea value={newPage.description} onChange={e=>setNewPage(p=>({...p,description:e.target.value}))} placeholder="Short description for this page…" style={{ ...baseInput, minHeight:70, resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={doAddPage} disabled={!newPage.title||!newPage.slug} style={{ flex:1, background:newPage.title&&newPage.slug?`linear-gradient(135deg,${C.navy},#2d51b8)`:C.muted, color:C.white, border:"none", cursor:newPage.title&&newPage.slug?"pointer":"default", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"13px", borderRadius:100 }}>Add Page</button>
              <button onClick={()=>setShowAdd(false)} style={{ flex:1, background:C.warmGray, color:C.muted, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"13px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* DELETE CONFIRM */}
      {confirmDel && (
        <>
          <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(360px,90vw)", zIndex:401, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>Delete this page?</div>
            <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, marginBottom:24 }}>This cannot be undone.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{deletePage(confirmDel);setConfirmDel(null);}} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Delete</button>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
