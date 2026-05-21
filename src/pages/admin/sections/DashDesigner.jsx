import { useState } from "react";
import { C } from "../../../constants/theme";
import { useStyle, SECTION_DEFS, STYLE_CONTROLS } from "../../../context/StyleContext";

const PAGES = [...new Set(SECTION_DEFS.map(s=>s.page))];

export default function DashDesigner() {
  const { styles, setSection, resetSection, resetAllStyles } = useStyle();
  const [activePage, setActivePage] = useState(PAGES[0]);
  const [activeSection, setActiveSection] = useState(SECTION_DEFS.find(s=>s.page===PAGES[0])?.id||"");
  const [confirmReset, setConfirmReset] = useState(false);

  const sections = SECTION_DEFS.filter(s=>s.page===activePage);
  const sectionStyles = styles[activeSection] || {};

  const hasOverrides = Object.keys(styles).length > 0;
  const hasSectionOverrides = Object.keys(sectionStyles).length > 0;

  const ControlInput = ({ ctrl }) => {
    const val = sectionStyles[ctrl.key];

    if (ctrl.type === "color") {
      return (
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <input type="color" value={val||"#ffffff"} onChange={e=>setSection(activeSection,ctrl.key,e.target.value)}
            style={{ width:44, height:36, border:`1.5px solid ${C.navy}18`, borderRadius:8, padding:2, cursor:"pointer", background:"none" }} />
          <input type="text" value={val||""} onChange={e=>setSection(activeSection,ctrl.key,e.target.value)} placeholder="#ffffff or empty to clear"
            style={{ flex:1, padding:"9px 12px", border:`1.5px solid ${C.navy}18`, borderRadius:8, fontFamily:"Nunito", fontSize:12.5, color:C.text, background:C.white, outline:"none" }} />
          {val && <button onClick={()=>setSection(activeSection,ctrl.key,"")} style={{ background:`${C.coral}12`, color:C.coral, border:"none", cursor:"pointer", fontFamily:"Nunito", fontSize:11, padding:"5px 10px", borderRadius:6 }}>clear</button>}
        </div>
      );
    }

    if (ctrl.type === "gradient") {
      const gval = val || { from:"#1B3F8B", to:"#0f2a70" };
      return (
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, marginBottom:3 }}>From</div>
            <input type="color" value={gval.from||"#1B3F8B"} onChange={e=>setSection(activeSection,ctrl.key,{...gval,from:e.target.value})}
              style={{ width:44, height:34, border:`1.5px solid ${C.navy}18`, borderRadius:8, padding:2, cursor:"pointer" }} />
          </div>
          <div style={{ flex:1, height:34, borderRadius:8, background:`linear-gradient(135deg,${gval.from||"#1B3F8B"},${gval.to||"#0f2a70"})` }}/>
          <div>
            <div style={{ fontFamily:"Nunito", fontSize:10, color:C.muted, marginBottom:3 }}>To</div>
            <input type="color" value={gval.to||"#0f2a70"} onChange={e=>setSection(activeSection,ctrl.key,{...gval,to:e.target.value})}
              style={{ width:44, height:34, border:`1.5px solid ${C.navy}18`, borderRadius:8, padding:2, cursor:"pointer" }} />
          </div>
          {val && <button onClick={()=>setSection(activeSection,ctrl.key,null)} style={{ background:`${C.coral}12`, color:C.coral, border:"none", cursor:"pointer", fontFamily:"Nunito", fontSize:11, padding:"5px 10px", borderRadius:6 }}>clear</button>}
        </div>
      );
    }

    if (ctrl.type === "range") {
      return (
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <input type="range" min={ctrl.min} max={ctrl.max} step={ctrl.step||1} value={val||ctrl.min}
            onChange={e=>setSection(activeSection,ctrl.key,Number(e.target.value))}
            style={{ flex:1, accentColor:C.navy }} />
          <span style={{ fontFamily:"Fredoka One", fontSize:16, color:C.navy, minWidth:40, textAlign:"right" }}>{val!=null?val:ctrl.min}</span>
          {val!=null && <button onClick={()=>setSection(activeSection,ctrl.key,null)} style={{ background:`${C.coral}12`, color:C.coral, border:"none", cursor:"pointer", fontFamily:"Nunito", fontSize:11, padding:"5px 10px", borderRadius:6 }}>clear</button>}
        </div>
      );
    }

    if (ctrl.type === "select") {
      return (
        <div style={{ display:"flex", gap:8 }}>
          {ctrl.opts.map(opt=>(
            <button key={opt} onClick={()=>setSection(activeSection,ctrl.key,val===opt?null:opt)}
              style={{ flex:1, padding:"8px 4px", border:`1.5px solid ${val===opt?C.navy:`${C.navy}18`}`, borderRadius:8, background:val===opt?C.navy:"transparent", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:val===opt?C.white:C.muted, textTransform:"capitalize" }}>{opt}</button>
          ))}
        </div>
      );
    }

    if (ctrl.type === "toggle") {
      return (
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={()=>setSection(activeSection,ctrl.key,!val)}
            style={{ width:48, height:26, borderRadius:100, border:"none", cursor:"pointer", background:val?C.coral:`${C.navy}25`, position:"relative", transition:"background 0.25s" }}>
            <div style={{ position:"absolute", top:3, left:val?24:3, width:20, height:20, borderRadius:"50%", background:C.white, transition:"left 0.25s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }}/>
          </button>
          <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:val?C.coral:C.muted }}>{val?"Hidden":"Visible"}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Section Designer</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Customize backgrounds, spacing, colours, and alignment for every section on every page. Changes apply instantly — no reload needed.</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>window.open("/","_blank")} style={{ background:`${C.navy}10`, color:C.navy, border:`1px solid ${C.navy}20`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 18px", borderRadius:100 }}>↗ Preview Site</button>
          {hasOverrides && <button onClick={()=>setConfirmReset(true)} style={{ background:`${C.coral}12`, color:C.coral, border:`1px solid ${C.coral}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 18px", borderRadius:100 }}>Reset All Styles</button>}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"180px 220px 1fr", gap:16, alignItems:"start" }}>
        {/* Page selector */}
        <div style={{ background:C.white, borderRadius:14, padding:"10px 8px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"6px 10px 10px" }}>Page</div>
          {PAGES.map(p => (
            <button key={p} onClick={()=>{ setActivePage(p); setActiveSection(SECTION_DEFS.find(s=>s.page===p)?.id||""); }}
              style={{ width:"100%", display:"block", padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:12.5, background:activePage===p?`${C.navy}12`:C.white, color:activePage===p?C.navy:C.text, borderLeft:activePage===p?`3px solid ${C.navy}`:"3px solid transparent", marginBottom:2 }}>{p}</button>
          ))}
        </div>

        {/* Section selector */}
        <div style={{ background:C.white, borderRadius:14, padding:"10px 8px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", padding:"6px 10px 10px" }}>Section</div>
          {sections.map(s => {
            const hasStyle = Object.keys(styles[s.id]||{}).filter(k=>styles[s.id][k]!=null&&styles[s.id][k]!=="").length > 0;
            return (
              <button key={s.id} onClick={()=>setActiveSection(s.id)}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer", textAlign:"left", fontFamily:"Nunito", fontWeight:700, fontSize:12, background:activeSection===s.id?`${C.coral}12`:C.white, color:activeSection===s.id?C.coral:C.text, borderLeft:activeSection===s.id?`3px solid ${C.coral}`:"3px solid transparent", marginBottom:2 }}>
                <span>{s.label}</span>
                {hasStyle && <span style={{ width:7, height:7, borderRadius:"50%", background:C.coral, flexShrink:0 }}/>}
              </button>
            );
          })}
        </div>

        {/* Style controls */}
        <div style={{ background:C.white, borderRadius:16, padding:"24px 26px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div>
              <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e" }}>
                {SECTION_DEFS.find(s=>s.id===activeSection)?.label || "Select a section"}
              </div>
              <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:2 }}>{activePage} page</div>
            </div>
            {hasSectionOverrides && (
              <button onClick={()=>resetSection(activeSection)} style={{ background:`${C.coral}12`, color:C.coral, border:`1px solid ${C.coral}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 14px", borderRadius:100 }}>Reset Section</button>
            )}
          </div>

          <div style={{ marginBottom:14, padding:"10px 14px", background:`${C.navy}06`, borderRadius:10 }}>
            <p style={{ fontFamily:"Nunito", fontSize:12, color:C.navy, margin:0 }}>
              💡 Changes apply <strong>instantly</strong> on the live site (open it in another tab to see). CSS overrides use <code>!important</code> and beat all inline styles.
            </p>
          </div>

          {STYLE_CONTROLS.map(ctrl => (
            <div key={ctrl.key} style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:7 }}>{ctrl.label}</label>
              <ControlInput ctrl={ctrl} />
            </div>
          ))}

          {hasSectionOverrides && (
            <div style={{ marginTop:8, paddingTop:16, borderTop:`1px solid ${C.navy}08` }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Active overrides for this section</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {Object.entries(sectionStyles).filter(([,v])=>v!=null&&v!=="").map(([k,v])=>(
                  <span key={k} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, background:`${C.mint}18`, color:C.mint, padding:"3px 10px", borderRadius:100 }}>
                    {STYLE_CONTROLS.find(c=>c.key===k)?.label||k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How it works guide */}
      <div style={{ background:C.white, borderRadius:16, padding:"22px 26px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)", marginTop:20 }}>
        <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e", marginBottom:14 }}>How the Designer Works</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:12 }}>
          {[
            { icon:"🎨", title:"Background",   body:"Set a solid colour or gradient for any section's background. Overrides the original design colour instantly." },
            { icon:"📐", title:"Spacing",       body:"Adjust padding top/bottom to make sections taller or shorter — great for breathing room or compact layouts." },
            { icon:"↔️",  title:"Text Alignment",body:"Align all headings and body text left, centre, or right within any section — without touching any code." },
            { icon:"🎭", title:"Colours",       body:"Override heading and body text colours to match any rebrand or seasonal theme you're running." },
            { icon:"👁️",  title:"Hide Sections", body:"Temporarily hide any section from public view — useful for seasonal content or testing new layouts." },
            { icon:"🔄", title:"Reset Anytime", body:"Clear any override per section or reset everything back to the original design with one click." },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{ background:"#F8F9FC", borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"#1a1a2e", marginBottom:4 }}>{title}</div>
              <p style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, lineHeight:1.6, margin:0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm reset modal */}
      {confirmReset && (
        <>
          <div onClick={()=>setConfirmReset(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(380px,90vw)", zIndex:401, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎨</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>Reset All Style Overrides?</div>
            <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, marginBottom:24 }}>All design customisations will be cleared and the site will return to its original design.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{resetAllStyles();setConfirmReset(false);}} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Reset All</button>
              <button onClick={()=>setConfirmReset(false)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
