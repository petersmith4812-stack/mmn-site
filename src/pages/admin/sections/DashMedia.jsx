import { useState } from "react";
import { C } from "../../../constants/theme";

const DEFAULT_MEDIA = {
  logoUrl: "", faviconUrl: "",
  heroHome: "", heroAbout: "", heroPrograms: "", heroMothers: "", heroAdmissions: "", heroContact: "",
  ogImage: "",
};

const loadMedia = () => {
  try { const v = localStorage.getItem("mmn_media"); return v ? { ...DEFAULT_MEDIA, ...JSON.parse(v) } : { ...DEFAULT_MEDIA }; } catch { return { ...DEFAULT_MEDIA }; }
};

const saveMedia = (v) => { try { localStorage.setItem("mmn_media", JSON.stringify(v)); } catch {} };

export default function DashMedia() {
  const [media, setMedia] = useState(loadMedia);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setMedia(p => ({ ...p, [k]: v }));

  const save = () => {
    saveMedia(media);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (media.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
      link.href = media.faviconUrl;
    }
  };

  const SECTIONS = [
    {
      title:"Brand Identity", items:[
        { key:"logoUrl",     label:"Logo Image URL",    hint:"Paste a URL to your logo image (PNG or SVG, transparent bg recommended, height ~50px)" },
        { key:"faviconUrl",  label:"Favicon URL",       hint:"Square image (32×32 or 64×64 px). Paste the URL. Saves instantly to browser tab." },
        { key:"ogImage",     label:"Social Preview Image (OG)", hint:"1200×630 px image shown when the site is shared on WhatsApp / Facebook / Twitter." },
      ],
    },
    {
      title:"Page Hero Images", items:[
        { key:"heroHome",      label:"Home Page Hero"      },
        { key:"heroAbout",     label:"About Page Hero"     },
        { key:"heroPrograms",  label:"Programs Page Hero"  },
        { key:"heroMothers",   label:"For Mothers Hero"    },
        { key:"heroAdmissions",label:"Admissions Hero"     },
        { key:"heroContact",   label:"Contact Page Hero"   },
      ],
    },
  ];

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Media Manager</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Update logo, favicon, and hero images across every page.</p>
        </div>
        <button onClick={save} style={{ background:saved?C.mint:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 24px", borderRadius:100, boxShadow:saved?"none":`0 4px 14px ${C.navy}35`, transition:"all 0.25s" }}>
          {saved ? "✓ Saved!" : "Save All Media"}
        </button>
      </div>

      <div style={{ marginBottom:16, padding:"12px 16px", background:`${C.navy}08`, borderRadius:12 }}>
        <p style={{ fontFamily:"Nunito", fontSize:12.5, color:C.navy, margin:0 }}>
          📌 <strong>How to add images:</strong> Upload your image to a free host like <strong>imgbb.com</strong>, <strong>Cloudinary</strong>, or your Google Drive (shared publicly), then paste the direct image URL here.
        </p>
      </div>

      {SECTIONS.map(({ title, items }) => (
        <div key={title} style={{ background:C.white, borderRadius:18, padding:"24px 28px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:20 }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e", marginBottom:20, paddingBottom:12, borderBottom:`1px solid ${C.navy}08` }}>{title}</div>
          {items.map(({ key, label, hint }) => (
            <div key={key} style={{ marginBottom:20 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 }}>{label}</label>
              {hint && <p style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, margin:"0 0 8px", lineHeight:1.5 }}>{hint}</p>}
              <div style={{ display:"flex", gap:12, alignItems:"flex-start", flexWrap:"wrap" }}>
                <input type="url" value={media[key]||""} onChange={e=>set(key,e.target.value)} placeholder="https://…" style={{ ...baseInput, flex:1, minWidth:200 }}
                  onFocus={e=>e.target.style.borderColor=C.coral}
                  onBlur={e=>e.target.style.borderColor=`${C.navy}18`}
                />
                {media[key] && (
                  <div style={{ width:80, height:56, borderRadius:10, border:`2px solid ${C.navy}15`, overflow:"hidden", background:"#F5F5F5", flexShrink:0 }}>
                    <img src={media[key]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{ e.target.style.display="none"; }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Logo preview */}
      {(media.logoUrl || media.faviconUrl) && (
        <div style={{ background:C.white, borderRadius:18, padding:"24px 28px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:18, color:"#1a1a2e", marginBottom:16 }}>Preview</div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {media.logoUrl && (
              <div>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Logo</div>
                <div style={{ background:"#0F1D3E", padding:"12px 20px", borderRadius:12, display:"inline-block" }}>
                  <img src={media.logoUrl} alt="Logo" style={{ height:40, display:"block" }} onError={e=>e.target.style.display="none"} />
                </div>
              </div>
            )}
            {media.faviconUrl && (
              <div>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Favicon</div>
                <div style={{ background:"#F0F0F0", padding:"12px", borderRadius:12, display:"inline-block" }}>
                  <img src={media.faviconUrl} alt="Favicon" style={{ width:32, height:32, display:"block" }} onError={e=>e.target.style.display="none"} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
