import { useState } from "react";
import { C } from "../../../constants/theme";
import { useAdmin } from "../../../context/AdminContext";

const PAGES = [
  { key:"home",       label:"Home",        icon:"🏠", slug:"/" },
  { key:"about",      label:"About",       icon:"🏛️", slug:"/about" },
  { key:"programs",   label:"Programs",    icon:"📚", slug:"/programs" },
  { key:"mothers",    label:"For Mothers", icon:"👩‍👧", slug:"/for-mothers" },
  { key:"admissions", label:"Admissions",  icon:"🎓", slug:"/admissions" },
  { key:"contact",    label:"Contact",     icon:"📬", slug:"/contact" },
  { key:"blog",       label:"Blog",        icon:"📝", slug:"/blog" },
];

const DEFAULT_SCHEMA = `{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Mini Muslims Nest",
  "description": "A child-led, mother-present Islamic preschool in Lahore, Pakistan.",
  "url": "https://minimuslimsnest.com",
  "telephone": "+92-306-505-8989",
  "email": "minimuslimsnest@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lahore",
    "addressCountry": "PK"
  },
  "sameAs": []
}`;

const ScoreBar = ({ label, score, tip }) => (
  <div style={{ marginBottom:10 }}>
    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
      <span style={{ fontFamily:"Nunito", fontWeight:600, fontSize:12.5, color:C.text }}>{label}</span>
      <span style={{ fontFamily:"Fredoka One", fontSize:14, color:score>=70?"#22C55E":score>=40?C.yellow:C.coral }}>{score}/100</span>
    </div>
    <div style={{ height:7, background:`${C.navy}10`, borderRadius:100, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${score}%`, background:score>=70?"#22C55E":score>=40?C.yellow:C.coral, borderRadius:100, transition:"width 0.6s ease" }}/>
    </div>
    {tip && <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginTop:3 }}>{tip}</div>}
  </div>
);

const scorePage = (seo) => {
  let s = 0;
  if (seo?.metaTitle)              s += 25;
  if (seo?.metaDescription)        s += 25;
  if (seo?.keywords)               s += 10;
  if (seo?.ogImage)                s += 15;
  if (seo?.schema)                 s += 15;
  if ((seo?.metaTitle||"").length <= 60)         s += 5;
  if ((seo?.metaDescription||"").length <= 160)  s += 5;
  return Math.min(s, 100);
};

export default function DashSEO() {
  const { seoPages, updateSEOPage } = useAdmin();
  const [activePage, setActivePage] = useState("home");
  const [draft, setDraft] = useState({ ...(seoPages["home"]||{}) });
  const [saved, setSaved] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [showSchema, setShowSchema] = useState(false);

  const switchPage = (key) => {
    setActivePage(key);
    setDraft({ ...(seoPages[key]||{}) });
    setSaved(false); setUnsaved(false);
  };

  const setF = (k,v) => { setDraft(p=>({...p,[k]:v})); setUnsaved(true); setSaved(false); };

  const save = () => {
    updateSEOPage(activePage, draft);
    setSaved(true); setUnsaved(false);
    setTimeout(()=>setSaved(false), 2500);
  };

  const injectSchema = () => { setF("schema", DEFAULT_SCHEMA); };

  const score = scorePage(draft);
  const titleLen = (draft.metaTitle||"").length;
  const descLen  = (draft.metaDescription||"").length;

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };
  const onFocus = e => e.target.style.borderColor = C.coral;
  const onBlur  = e => e.target.style.borderColor = `${C.navy}18`;

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>SEO Manager</h2>
        <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Set meta title, description, Open Graph, keywords and schema markup per page. Changes apply instantly without page reload.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:20, alignItems:"start" }}>
        {/* Page list */}
        <div style={{ background:C.white, borderRadius:14, padding:"10px 8px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
          {PAGES.map(({ key, label, icon }) => {
            const s = scorePage(seoPages[key]);
            return (
              <button key={key} onClick={()=>switchPage(key)}
                style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 12px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12.5, background:activePage===key?`${C.navy}12`:"transparent", color:activePage===key?C.navy:C.text, borderLeft:activePage===key?`3px solid ${C.navy}`:"3px solid transparent", marginBottom:2 }}>
                <span>{icon} {label}</span>
                <span style={{ width:10, height:10, borderRadius:"50%", background:s>=70?"#22C55E":s>=40?C.yellow:C.coral, flexShrink:0 }}/>
              </button>
            );
          })}
          <div style={{ padding:"10px 10px 4px", borderTop:`1px solid ${C.navy}08`, marginTop:4 }}>
            <div style={{ fontFamily:"Nunito", fontSize:10.5, color:C.muted, marginBottom:4 }}>Legend</div>
            {[["#22C55E","Strong (70–100)"],["#F5C518","Needs work (40–70)"],[C.coral,"Weak (0–40)"]].map(([c,l])=>(
              <div key={l} style={{ display:"flex", gap:6, alignItems:"center", marginBottom:4 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/>
                <span style={{ fontFamily:"Nunito", fontSize:10, color:C.muted }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Score card */}
          <div style={{ background:C.white, borderRadius:16, padding:"20px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e" }}>
                {PAGES.find(p=>p.key===activePage)?.icon} {PAGES.find(p=>p.key===activePage)?.label} Page SEO Score
              </div>
              <div style={{ fontFamily:"Fredoka One", fontSize:36, color:score>=70?"#22C55E":score>=40?C.yellow:C.coral }}>{score}</div>
            </div>
            <ScoreBar label="Meta Title" score={draft.metaTitle?Math.min(100,Math.round((Math.min(titleLen,60)/60)*100)):0} tip={`${titleLen}/60 chars ${titleLen>60?"⚠ Too long":titleLen>30?"✓ Good length":""}`} />
            <ScoreBar label="Meta Description" score={draft.metaDescription?Math.min(100,Math.round((Math.min(descLen,160)/160)*100)):0} tip={`${descLen}/160 chars ${descLen>160?"⚠ Too long":descLen>80?"✓ Good length":""}`} />
            <ScoreBar label="Keywords" score={draft.keywords?80:0} tip="Comma-separated keywords help search engines understand topics" />
            <ScoreBar label="OG Image" score={draft.ogImage?100:0} tip="Essential for link previews on WhatsApp, Facebook, Twitter" />
            <ScoreBar label="Schema Markup" score={draft.schema?100:0} tip="Structured data helps Google understand your business" />
          </div>

          {/* Form */}
          <div style={{ background:C.white, borderRadius:16, padding:"24px 26px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e" }}>Page SEO Settings</div>
              <div style={{ display:"flex", gap:10 }}>
                {unsaved && <button onClick={()=>{setDraft({...(seoPages[activePage]||{})});setUnsaved(false);}} style={{ background:C.warmGray, color:C.muted, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 16px", borderRadius:100 }}>Discard</button>}
                <button onClick={save} style={{ background:saved?C.mint:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"8px 22px", borderRadius:100, transition:"all 0.25s" }}>{saved?"✓ Saved!":"Save"}</button>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Meta Title <span style={{ color:titleLen>60?C.coral:C.mint }}>({titleLen}/60)</span></label>
              <input value={draft.metaTitle||""} onChange={e=>setF("metaTitle",e.target.value)} placeholder="Page Title — Site Name" style={{ ...baseInput, borderColor:titleLen>60?C.coral:`${C.navy}18` }} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Meta Description <span style={{ color:descLen>160?C.coral:C.mint }}>({descLen}/160)</span></label>
              <textarea value={draft.metaDescription||""} onChange={e=>setF("metaDescription",e.target.value)} placeholder="Concise summary that appears in Google search results…" style={{ ...baseInput, minHeight:70, resize:"vertical" }} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Keywords (comma separated)</label>
              <input value={draft.keywords||""} onChange={e=>setF("keywords",e.target.value)} placeholder="Islamic preschool Lahore, child-led learning, mother-present school" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>OG / Social Preview Image URL</label>
              <input value={draft.ogImage||""} onChange={e=>setF("ogImage",e.target.value)} placeholder="https://… (1200×630 px recommended)" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
              {draft.ogImage && <div style={{ marginTop:8, height:80, borderRadius:8, overflow:"hidden", background:"#F5F5F5" }}><img src={draft.ogImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} /></div>}
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>Canonical URL (optional)</label>
              <input value={draft.canonicalUrl||""} onChange={e=>setF("canonicalUrl",e.target.value)} placeholder="https://minimuslimsnest.com/about" style={baseInput} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em" }}>Schema / Structured Data (JSON-LD)</label>
                <div style={{ display:"flex", gap:8 }}>
                  {!draft.schema && <button onClick={injectSchema} style={{ background:`${C.mint}18`, color:C.mint, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"4px 12px", borderRadius:100 }}>Insert Template</button>}
                  <button onClick={()=>setShowSchema(!showSchema)} style={{ background:`${C.navy}10`, color:C.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"4px 12px", borderRadius:100 }}>{showSchema?"Collapse":"Expand"}</button>
                </div>
              </div>
              {showSchema && <textarea value={draft.schema||""} onChange={e=>setF("schema",e.target.value)} placeholder='{"@context":"https://schema.org","@type":"EducationalOrganization"…}' style={{ ...baseInput, minHeight:160, resize:"vertical", fontFamily:"monospace", fontSize:12 }} />}
              {!showSchema && draft.schema && <div style={{ padding:"8px 12px", background:`${C.mint}12`, border:`1px solid ${C.mint}30`, borderRadius:8, fontFamily:"Nunito", fontSize:12, color:C.mint }}>✓ Schema markup configured ({draft.schema.length} chars)</div>}
            </div>

            <button onClick={save} style={{ background:saved?C.mint:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px 32px", borderRadius:100, transition:"all 0.25s" }}>{saved?"✓ Saved!":"Save SEO Settings"}</button>
          </div>

          {/* Google preview */}
          {(draft.metaTitle || draft.metaDescription) && (
            <div style={{ background:C.white, borderRadius:16, padding:"20px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginTop:16 }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Google Search Preview</div>
              <div style={{ border:`1px solid #dfe1e5`, borderRadius:8, padding:"14px 16px", maxWidth:600 }}>
                <div style={{ fontFamily:"Arial", fontSize:11, color:"#202124", marginBottom:2 }}>minimuslimsnest.com › {PAGES.find(p=>p.key===activePage)?.slug?.replace("/","")}</div>
                <div style={{ fontFamily:"Arial", fontSize:18, color:"#1a0dab", fontWeight:400, marginBottom:4, lineHeight:1.3 }}>{draft.metaTitle||"Page Title"}</div>
                <div style={{ fontFamily:"Arial", fontSize:13, color:"#4d5156", lineHeight:1.58 }}>{draft.metaDescription||"Page description…"}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
