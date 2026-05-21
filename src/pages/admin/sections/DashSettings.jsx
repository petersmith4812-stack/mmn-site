import { useState } from "react";
import { C } from "../../../constants/theme";
import { useSiteContent } from "../../../context/SiteContentContext";
import { useAdmin } from "../../../context/AdminContext";

const COLOR_FIELDS = [
  { key:"navy",   label:"Navy (Primary)" },
  { key:"coral",  label:"Coral (Accent)" },
  { key:"mint",   label:"Mint (Green)"   },
  { key:"yellow", label:"Yellow (Highlight)" },
  { key:"cream",  label:"Cream (Background)" },
];

export default function DashSettings({ currentUser }) {
  const { content, updateSection, resetAll, exportData, importData } = useSiteContent();
  const { users, updateUser } = useAdmin();

  const [theme, setTheme]   = useState({ ...content.theme });
  const [themeSaved, setThemeSaved] = useState(false);

  const [oldPw, setOldPw]   = useState("");
  const [newPw1, setNewPw1] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwMsg, setPwMsg]   = useState({ text:"", ok:false });

  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg]   = useState({ text:"", ok:false });

  const [seo, setSeo] = useState(() => { try { return JSON.parse(localStorage.getItem("mmn_seo")||"{}"); } catch { return {}; } });
  const [seoSaved, setSeoSaved] = useState(false);

  const saveTheme = () => {
    updateSection("theme", theme);
    setThemeSaved(true);
    setTimeout(() => { setThemeSaved(false); window.location.reload(); }, 900);
  };

  const saveSeo = () => {
    localStorage.setItem("mmn_seo", JSON.stringify(seo));
    document.title = seo.title || document.title;
    setSeoSaved(true); setTimeout(()=>setSeoSaved(false), 2500);
  };

  const changePw = () => {
    const me = users.find(u=>u.id===currentUser.id);
    if (!me) return;
    if (me.password !== oldPw) { setPwMsg({text:"Current password incorrect.",ok:false}); return; }
    if (newPw1.length < 6)     { setPwMsg({text:"New password must be at least 6 characters.",ok:false}); return; }
    if (newPw1 !== newPw2)     { setPwMsg({text:"Passwords do not match.",ok:false}); return; }
    updateUser(me.id, {password:newPw1});
    setOldPw(""); setNewPw1(""); setNewPw2("");
    setPwMsg({text:"Password changed successfully.",ok:true});
    setTimeout(()=>setPwMsg({text:"",ok:false}), 3000);
  };

  const handleImport = () => {
    const ok = importData(importText);
    if (ok) {
      setImportMsg({text:"Imported successfully. Reloading…",ok:true});
      setTimeout(()=>window.location.reload(),1200);
    } else {
      setImportMsg({text:"Invalid JSON. Please check and try again.",ok:false});
    }
  };

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };

  const Box = ({ title, children }) => (
    <div style={{ background:C.white, borderRadius:18, padding:"26px 28px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:20 }}>
      <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e", marginBottom:18, paddingBottom:12, borderBottom:`1px solid ${C.navy}08` }}>{title}</div>
      {children}
    </div>
  );

  const SaveBtn = ({ onClick, saved, label="Save Changes", savedLabel="✓ Saved!" }) => (
    <button onClick={onClick} style={{ background:saved?C.mint:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 24px", borderRadius:100, transition:"all 0.25s", boxShadow:saved?"none":`0 4px 14px ${C.navy}35` }}>
      {saved ? savedLabel : label}
    </button>
  );

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Settings</h2>
        <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Brand colors, SEO, password, data management.</p>
      </div>

      {/* Brand Colors */}
      <Box title="🎨 Brand Colors">
        <div style={{ marginBottom:12, padding:"10px 14px", background:`${C.yellow}18`, borderRadius:10 }}>
          <p style={{ fontFamily:"Nunito", fontSize:12, color:"#7B6200", margin:0 }}>Color changes require a full page reload to apply. The page will reload automatically after saving.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16, marginBottom:20 }}>
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>{label}</label>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input type="color" value={theme[key]||"#000000"} onChange={e=>setTheme(p=>({...p,[key]:e.target.value}))} style={{ width:40, height:36, border:`1.5px solid ${C.navy}18`, borderRadius:8, padding:2, cursor:"pointer", background:"none" }} />
                <input type="text" value={theme[key]||""} onChange={e=>setTheme(p=>({...p,[key]:e.target.value}))} style={{ ...baseInput, padding:"8px 10px", fontSize:12 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
          {[
            {key:"cardRadius",   label:"Card Radius (px)"},
            {key:"cardPaddingV", label:"Card Padding V (px)"},
            {key:"cardPaddingH", label:"Card Padding H (px)"},
          ].map(({key,label})=>(
            <div key={key}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>{label}</label>
              <input type="number" value={theme[key]||0} onChange={e=>setTheme(p=>({...p,[key]:Number(e.target.value)}))} style={{ ...baseInput, padding:"9px 12px", fontSize:13 }} />
            </div>
          ))}
        </div>
        <SaveBtn onClick={saveTheme} saved={themeSaved} savedLabel="✓ Saved! Reloading…" />
      </Box>

      {/* SEO */}
      <Box title="🔍 SEO & Meta Tags">
        {[
          {key:"title", label:"Browser Tab Title", ph:"Mini Muslims Nest — Islamic Preschool, Lahore"},
          {key:"description", label:"Meta Description (search snippet, ~160 chars)", ph:"A child-led, mother-present Islamic preschool…"},
          {key:"keywords", label:"Keywords (comma separated)", ph:"Islamic preschool, Lahore, child-led, Montessori"},
        ].map(({key,label,ph})=>(
          <div key={key} style={{ marginBottom:16 }}>
            <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>{label}</label>
            <input type="text" value={seo[key]||""} onChange={e=>setSeo(p=>({...p,[key]:e.target.value}))} placeholder={ph} style={baseInput} />
          </div>
        ))}
        <SaveBtn onClick={saveSeo} saved={seoSaved} />
      </Box>

      {/* Password */}
      <Box title="🔐 Change Password">
        {[
          {label:"Current Password", val:oldPw, set:setOldPw},
          {label:"New Password (min. 6)",     val:newPw1, set:setNewPw1},
          {label:"Confirm New Password",      val:newPw2, set:setNewPw2},
        ].map(({label,val,set})=>(
          <div key={label} style={{ marginBottom:14 }}>
            <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>{label}</label>
            <input type="password" value={val} onChange={e=>set(e.target.value)} style={baseInput} />
          </div>
        ))}
        {pwMsg.text && (
          <div style={{ padding:"10px 14px", background:pwMsg.ok?`${C.mint}15`:`${C.coral}12`, border:`1.5px solid ${pwMsg.ok?C.mint:C.coral}40`, borderRadius:10, fontFamily:"Nunito", fontSize:13, color:pwMsg.ok?C.mint:C.coral, marginBottom:14 }}>{pwMsg.text}</div>
        )}
        <button onClick={changePw} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 24px", borderRadius:100 }}>Update Password</button>
      </Box>

      {/* Data management */}
      <Box title="💾 Data Management">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color:"#1a1a2e", marginBottom:6 }}>Export Backup</div>
            <p style={{ fontFamily:"Nunito", fontSize:12.5, color:C.muted, lineHeight:1.6, marginBottom:14 }}>Download all site content as JSON. Use before making major changes.</p>
            <button onClick={exportData} style={{ background:C.navy, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 20px", borderRadius:100 }}>⬇ Download JSON</button>
          </div>
          <div>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color:"#1a1a2e", marginBottom:6 }}>Reset to Defaults</div>
            <p style={{ fontFamily:"Nunito", fontSize:12.5, color:C.muted, lineHeight:1.6, marginBottom:14 }}>Restore all content to original defaults. This cannot be undone.</p>
            <button onClick={()=>{ if(window.confirm("Reset all content to defaults? This removes all edits.")) { resetAll(); window.location.reload(); }}} style={{ background:`${C.coral}15`, color:C.coral, border:`1.5px solid ${C.coral}35`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"10px 20px", borderRadius:100 }}>Reset Everything</button>
          </div>
        </div>

        <div style={{ marginTop:20, paddingTop:20, borderTop:`1px solid ${C.navy}08` }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color:"#1a1a2e", marginBottom:6 }}>Import JSON</div>
          <textarea value={importText} onChange={e=>setImportText(e.target.value)} placeholder='Paste exported JSON here…' style={{ ...baseInput, minHeight:100, resize:"vertical", marginBottom:10, fontFamily:"monospace", fontSize:12 }} />
          {importMsg.text && <div style={{ padding:"10px 14px", background:importMsg.ok?`${C.mint}15`:`${C.coral}12`, border:`1.5px solid ${importMsg.ok?C.mint:C.coral}40`, borderRadius:10, fontFamily:"Nunito", fontSize:13, color:importMsg.ok?C.mint:C.coral, marginBottom:10 }}>{importMsg.text}</div>}
          <button onClick={handleImport} disabled={!importText.trim()} style={{ background:importText.trim()?C.mint:C.muted, color:C.white, border:"none", cursor:importText.trim()?"pointer":"default", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 20px", borderRadius:100 }}>⬆ Import</button>
        </div>
      </Box>

      <Box title="ℹ️ System Info">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
          {[
            {label:"Platform", val:"React 18 (CRA)"},
            {label:"Storage", val:"localStorage"},
            {label:"Your Role", val:currentUser.role},
            {label:"Session", val:"Active"},
          ].map(({label,val})=>(
            <div key={label} style={{ background:"#F8F9FC", borderRadius:10, padding:"12px 14px" }}>
              <div style={{ fontFamily:"Nunito", fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{label}</div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13.5, color:"#1a1a2e" }}>{val}</div>
            </div>
          ))}
        </div>
      </Box>
    </div>
  );
}
