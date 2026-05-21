import { useState } from "react";
import { C } from "../../../constants/theme";
import { useAdmin } from "../../../context/AdminContext";

const PLATFORMS = [
  { key:"instagram", label:"Instagram",  icon:"📸", color:"#E1306C", url:"https://instagram.com/", composer:"https://www.instagram.com/create/story/" },
  { key:"facebook",  label:"Facebook",   icon:"👥", color:"#1877F2", url:"https://facebook.com/", composer:"https://www.facebook.com/" },
  { key:"twitter",   label:"X (Twitter)",icon:"🐦", color:"#000000", url:"https://twitter.com/", composer:"https://twitter.com/intent/tweet?text=" },
  { key:"youtube",   label:"YouTube",    icon:"▶️", color:"#FF0000", url:"https://youtube.com/", composer:"https://studio.youtube.com/" },
  { key:"tiktok",    label:"TikTok",     icon:"🎵", color:"#000000", url:"https://tiktok.com/", composer:"https://www.tiktok.com/upload/" },
  { key:"whatsapp",  label:"WhatsApp",   icon:"💬", color:"#25D366", url:"https://wa.me/", composer:"https://web.whatsapp.com/" },
  { key:"linkedin",  label:"LinkedIn",   icon:"💼", color:"#0A66C2", url:"https://linkedin.com/", composer:"https://www.linkedin.com/sharing/share-offsite/" },
  { key:"pinterest", label:"Pinterest",  icon:"📌", color:"#E60023", url:"https://pinterest.com/", composer:"https://www.pinterest.com/pin/create/button/" },
];

const TIPS = [
  "Post on Tuesdays and Thursdays 10 AM–12 PM for best reach",
  "Reels and short videos get 3× more reach than images on Instagram",
  "Stories with polls or questions drive 60% more engagement",
  "Consistent branding (colors, fonts, tone) builds trust faster",
  "Always include a clear call-to-action — 'Book a visit', 'DM us', 'Link in bio'",
];

export default function DashSocial() {
  const { social, updateSocial } = useAdmin();
  const [draft, setDraft]         = useState({ ...social });
  const [saved, setSaved]         = useState(false);
  const [postText, setPostText]   = useState("");
  const [selPlatforms, setSelPlatforms] = useState([]);
  const [copied, setCopied]       = useState(false);
  const [drafts, setDrafts]       = useState(() => { try { return JSON.parse(localStorage.getItem("mmn_social_drafts")||"[]"); } catch { return []; } });

  const saveDraft = (id, patch) => setDraft(p=>({...p,[id]:patch}));
  const saveAll = () => { updateSocial(draft); setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const togglePlatform = (k) => setSelPlatforms(p => p.includes(k)?p.filter(x=>x!==k):[...p,k]);

  const copyPost = () => {
    navigator.clipboard.writeText(postText).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  };

  const savePostDraft = () => {
    if (!postText.trim()) return;
    const d = { id:Date.now(), text:postText, platforms:selPlatforms, date:new Date().toISOString() };
    const updated = [d, ...drafts].slice(0,20);
    setDrafts(updated);
    localStorage.setItem("mmn_social_drafts", JSON.stringify(updated));
    setPostText(""); setSelPlatforms([]);
  };

  const deleteDraft = (id) => {
    const updated = drafts.filter(d=>d.id!==id);
    setDrafts(updated);
    localStorage.setItem("mmn_social_drafts", JSON.stringify(updated));
  };

  const openOnPlatform = (platform, text) => {
    const p = PLATFORMS.find(x=>x.key===platform);
    if (!p) return;
    const encodedText = encodeURIComponent(text);
    if (platform === "twitter") window.open(`${p.composer}${encodedText}`, "_blank");
    else window.open(p.composer, "_blank");
  };

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Social Media Hub</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>Manage profiles, compose posts, and plan your content.</p>
        </div>
        <button onClick={saveAll} style={{ background:saved?C.mint:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 24px", borderRadius:100, transition:"all 0.25s" }}>
          {saved ? "✓ Saved!" : "Save All Links"}
        </button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Social Links */}
        <div style={{ background:C.white, borderRadius:18, padding:"24px 22px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e", marginBottom:18 }}>Profile Links</div>
          {PLATFORMS.map(({ key, label, icon, color, url }) => (
            <div key={key} style={{ marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color }}>{label}</label>
                {draft[key] && <a href={draft[key]} target="_blank" rel="noreferrer" style={{ fontFamily:"Nunito", fontSize:11, color:color, textDecoration:"none", marginLeft:"auto" }}>↗ Open</a>}
              </div>
              <input type="url" value={draft[key]||""} onChange={e=>saveDraft(key,e.target.value)} placeholder={`${url}yourprofile`} style={{ ...baseInput }}
                onFocus={e=>e.target.style.borderColor=color}
                onBlur={e=>e.target.style.borderColor=`${C.navy}18`}
              />
            </div>
          ))}
        </div>

        {/* Post Composer */}
        <div>
          <div style={{ background:C.white, borderRadius:18, padding:"24px 22px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:16 }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e", marginBottom:4 }}>Post Composer</div>
            <p style={{ fontFamily:"Nunito", fontSize:12.5, color:C.muted, margin:"0 0 16px" }}>Write your post, select platforms, then copy & paste or open directly.</p>

            {/* Platform selector */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
              {PLATFORMS.map(({ key, icon, color }) => (
                <button key={key} onClick={()=>togglePlatform(key)} style={{ width:38, height:38, borderRadius:"50%", border:`2px solid ${selPlatforms.includes(key)?color:`${C.navy}15`}`, background:selPlatforms.includes(key)?`${color}18`:"#F9F9F9", cursor:"pointer", fontSize:18 }} title={PLATFORMS.find(p=>p.key===key)?.label}>{icon}</button>
              ))}
            </div>

            <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Write your post here…&#10;&#10;Include emojis, hashtags, and a clear call-to-action." style={{ ...baseInput, minHeight:120, resize:"vertical", marginBottom:12 }} />

            <div style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted, marginBottom:12, textAlign:"right" }}>{postText.length} chars</div>

            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={copyPost} disabled={!postText.trim()} style={{ flex:1, background:copied?C.mint:C.navy, color:C.white, border:"none", cursor:postText.trim()?"pointer":"default", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 14px", borderRadius:100, transition:"all 0.2s" }}>
                {copied ? "✓ Copied!" : "📋 Copy Text"}
              </button>
              <button onClick={savePostDraft} disabled={!postText.trim()} style={{ flex:1, background:`${C.coral}15`, color:C.coral, border:`1.5px solid ${C.coral}30`, cursor:postText.trim()?"pointer":"default", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"10px 14px", borderRadius:100 }}>
                💾 Save Draft
              </button>
            </div>

            {selPlatforms.length > 0 && postText.trim() && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Quick Launch</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {selPlatforms.map(pk => {
                    const p = PLATFORMS.find(x=>x.key===pk);
                    return <button key={pk} onClick={()=>openOnPlatform(pk,postText)} style={{ background:`${p.color}15`, color:p.color, border:`1px solid ${p.color}30`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"7px 14px", borderRadius:100 }}>{p.icon} Open {p.label}</button>;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div style={{ background:`linear-gradient(135deg,${C.navy}08,${C.coral}06)`, borderRadius:16, padding:"18px 20px" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:12 }}>💡 Social Media Tips</div>
            {TIPS.map((tip,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:C.coral, marginTop:6, flexShrink:0 }}/>
                <span style={{ fontFamily:"Nunito", fontSize:12.5, color:C.text, lineHeight:1.6 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Drafts */}
      {drafts.length > 0 && (
        <div style={{ background:C.white, borderRadius:18, padding:"22px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e" }}>Saved Drafts ({drafts.length})</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
            {drafts.map(d => (
              <div key={d.id} style={{ background:"#F8F9FC", borderRadius:12, padding:"14px 16px", border:`1px solid ${C.navy}10` }}>
                <p style={{ fontFamily:"Nunito", fontSize:13, color:C.text, lineHeight:1.6, margin:"0 0 10px", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{d.text}</p>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  {(d.platforms||[]).map(pk=><span key={pk} style={{ fontSize:16 }}>{PLATFORMS.find(x=>x.key===pk)?.icon}</span>)}
                  <span style={{ fontFamily:"Nunito", fontSize:10.5, color:C.muted, marginLeft:"auto" }}>{new Date(d.date).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</span>
                  <button onClick={()=>{setPostText(d.text);setSelPlatforms(d.platforms||[]);}} style={{ background:C.navy, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"4px 10px", borderRadius:100 }}>Edit</button>
                  <button onClick={()=>deleteDraft(d.id)} style={{ background:`${C.coral}12`, color:C.coral, border:`1px solid ${C.coral}25`, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"4px 10px", borderRadius:100 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
