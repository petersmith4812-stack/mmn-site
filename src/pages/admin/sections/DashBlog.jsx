import { useState } from "react";
import { C } from "../../../constants/theme";
import { useAdmin } from "../../../context/AdminContext";

const ID = () => Math.random().toString(36).substr(2,9);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const readingTime = (blocks=[]) => Math.max(1,Math.ceil(blocks.filter(b=>["paragraph","heading"].includes(b.type)).map(b=>b.text||"").join(" ").split(/\s+/).length/200));

const BLOCK_TYPES = [
  { type:"heading",   icon:"H",   label:"Heading"    },
  { type:"paragraph", icon:"P",   label:"Paragraph"  },
  { type:"image",     icon:"IMG", label:"Image"      },
  { type:"quote",     icon:"Q",   label:"Quote"      },
  { type:"list",      icon:"UL",  label:"List"       },
  { type:"callout",   icon:"!",   label:"Callout"    },
  { type:"divider",   icon:"—",   label:"Divider"    },
  { type:"html",      icon:"</>", label:"HTML Embed" },
];

const CATEGORIES = ["Islamic Parenting","Child Development","Montessori","Waldorf","Reggio Emilia","Quran & Faith","For Mothers","School News","Events","Other"];
const LAYOUTS = [
  { id:"classic",     label:"Classic",    desc:"Centred content, max 720px" },
  { id:"full-width",  label:"Full Width", desc:"Full-width hero + wide content" },
  { id:"magazine",    label:"Magazine",   desc:"Wide header + sidebar layout" },
];

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";

function BlockEditor({ blocks, setBlocks }) {
  const addBlock = (type) => setBlocks(p=>[...p,{id:ID(),type,...(type==="heading"?{level:2,text:""}:type==="paragraph"?{text:""}:type==="image"?{url:"",caption:"",alt:""}:type==="quote"?{text:"",author:""}:type==="list"?{items:["",""],ordered:false}:type==="callout"?{text:"",color:C.mint}:type==="html"?{html:""}:{})}]);
  const removeBlock = (id) => setBlocks(p=>p.filter(b=>b.id!==id));
  const updateBlock = (id,patch) => setBlocks(p=>p.map(b=>b.id===id?{...b,...patch}:b));
  const moveBlock = (id,dir) => setBlocks(p=>{const i=p.findIndex(b=>b.id===id);if((dir===-1&&i===0)||(dir===1&&i===p.length-1))return p;const a=[...p];[a[i],a[i+dir]]=[a[i+dir],a[i]];return a;});

  const ta = { width:"100%", padding:"10px 12px", border:`1.5px solid ${C.navy}15`, borderRadius:8, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", resize:"vertical" };

  return (
    <div>
      {blocks.map((b,i)=>(
        <div key={b.id} style={{ marginBottom:10, border:`1.5px solid ${C.navy}10`, borderRadius:12, overflow:"hidden" }}>
          <div style={{ background:"#F8F9FC", padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:"Fredoka One", fontSize:12, color:C.navy, background:`${C.navy}12`, padding:"2px 8px", borderRadius:6 }}>{BLOCK_TYPES.find(t=>t.type===b.type)?.label||b.type}</span>
            <div style={{ flex:1 }}/>
            <button onClick={()=>moveBlock(b.id,-1)} disabled={i===0} style={{ background:"none", border:"none", cursor:i===0?"default":"pointer", color:C.muted, fontSize:14, opacity:i===0?0.3:1 }}>↑</button>
            <button onClick={()=>moveBlock(b.id,1)} disabled={i===blocks.length-1} style={{ background:"none", border:"none", cursor:i===blocks.length-1?"default":"pointer", color:C.muted, fontSize:14, opacity:i===blocks.length-1?0.3:1 }}>↓</button>
            <button onClick={()=>removeBlock(b.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.coral, fontSize:14 }}>✕</button>
          </div>
          <div style={{ padding:"12px 14px" }}>
            {b.type==="heading" && (
              <div style={{ display:"flex", gap:8 }}>
                <select value={b.level||2} onChange={e=>updateBlock(b.id,{level:Number(e.target.value)})} style={{ ...ta, width:60, padding:"8px", resize:"none" }}>
                  {[1,2,3].map(l=><option key={l} value={l}>H{l}</option>)}
                </select>
                <input value={b.text||""} onChange={e=>updateBlock(b.id,{text:e.target.value})} placeholder="Heading text…" style={{ ...ta, flex:1, minHeight:"auto", resize:"none" }} />
              </div>
            )}
            {b.type==="paragraph" && <textarea value={b.text||""} onChange={e=>updateBlock(b.id,{text:e.target.value})} placeholder="Paragraph text…" style={{ ...ta, minHeight:80 }} />}
            {b.type==="image" && (
              <div>
                <input value={b.url||""} onChange={e=>updateBlock(b.id,{url:e.target.value})} placeholder="Image URL (https://…)" style={{ ...ta, marginBottom:6, minHeight:"auto", resize:"none" }} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <input value={b.alt||""} onChange={e=>updateBlock(b.id,{alt:e.target.value})} placeholder="Alt text (SEO)" style={{ ...ta, minHeight:"auto", resize:"none" }} />
                  <input value={b.caption||""} onChange={e=>updateBlock(b.id,{caption:e.target.value})} placeholder="Caption (optional)" style={{ ...ta, minHeight:"auto", resize:"none" }} />
                </div>
                {b.url && <img src={b.url} alt={b.alt} style={{ maxHeight:120, borderRadius:8, marginTop:8, objectFit:"cover" }} onError={e=>e.target.style.display="none"} />}
              </div>
            )}
            {b.type==="quote" && (
              <div>
                <textarea value={b.text||""} onChange={e=>updateBlock(b.id,{text:e.target.value})} placeholder="Quote text…" style={{ ...ta, minHeight:60, marginBottom:6 }} />
                <input value={b.author||""} onChange={e=>updateBlock(b.id,{author:e.target.value})} placeholder="Author / Source" style={{ ...ta, minHeight:"auto", resize:"none" }} />
              </div>
            )}
            {b.type==="list" && (
              <div>
                {(b.items||[""]).map((item,idx)=>(
                  <div key={idx} style={{ display:"flex", gap:6, marginBottom:6 }}>
                    <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.navy, width:20, flexShrink:0, paddingTop:8 }}>{b.ordered?`${idx+1}.`:"•"}</span>
                    <input value={item} onChange={e=>{const items=[...(b.items||[])];items[idx]=e.target.value;updateBlock(b.id,{items});}} placeholder={`Item ${idx+1}`} style={{ ...ta, flex:1, minHeight:"auto", resize:"none" }} />
                    {(b.items||[]).length>1 && <button onClick={()=>updateBlock(b.id,{items:(b.items||[]).filter((_,x)=>x!==idx)})} style={{ background:"none", border:"none", cursor:"pointer", color:C.coral, fontSize:16, paddingTop:6 }}>✕</button>}
                  </div>
                ))}
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <button onClick={()=>updateBlock(b.id,{items:[...(b.items||[]),""]}) } style={{ background:`${C.mint}18`, color:C.mint, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11.5, padding:"5px 12px", borderRadius:100 }}>+ Item</button>
                  <button onClick={()=>updateBlock(b.id,{ordered:!b.ordered})} style={{ background:`${C.navy}10`, color:C.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:11.5, padding:"5px 12px", borderRadius:100 }}>{b.ordered?"→ Bullets":"→ Numbered"}</button>
                </div>
              </div>
            )}
            {b.type==="callout" && (
              <div>
                <textarea value={b.text||""} onChange={e=>updateBlock(b.id,{text:e.target.value})} placeholder="Callout / highlighted note…" style={{ ...ta, minHeight:60, marginBottom:6 }} />
                <div style={{ display:"flex", gap:8 }}>
                  {[C.mint,C.coral,C.yellow,C.navy,"#6C63FF"].map(col=>(
                    <button key={col} onClick={()=>updateBlock(b.id,{color:col})} style={{ width:28, height:28, borderRadius:"50%", border:`3px solid ${b.color===col?"#333":"transparent"}`, background:col, cursor:"pointer" }}/>
                  ))}
                </div>
              </div>
            )}
            {b.type==="html" && <textarea value={b.html||""} onChange={e=>updateBlock(b.id,{html:e.target.value})} placeholder="<iframe…> or any HTML embed" style={{ ...ta, minHeight:80, fontFamily:"monospace", fontSize:12 }} />}
            {b.type==="divider" && <div style={{ height:2, background:`${C.navy}10`, borderRadius:100 }}/>}
          </div>
        </div>
      ))}

      <div style={{ marginTop:12 }}>
        <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Add Block</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {BLOCK_TYPES.map(({ type, icon, label }) => (
            <button key={type} onClick={()=>addBlock(type)} style={{ display:"flex", alignItems:"center", gap:6, background:C.white, border:`1.5px solid ${C.navy}18`, borderRadius:100, cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, padding:"7px 14px", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background=`${C.navy}08`;e.currentTarget.style.borderColor=`${C.navy}40`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.white;e.currentTarget.style.borderColor=`${C.navy}18`;}}>
              <span style={{ fontSize:14 }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashBlog() {
  const { blogs, addBlog, updateBlog, deleteBlog } = useAdmin();
  const [view, setView]           = useState("list");
  const [editId, setEditId]       = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({ title:"", slug:"", excerpt:"", featuredImage:"", category:"Other", tags:"", author:"", status:"draft", layout:"classic", accentColor:C.navy, blocks:[], seo:{} });

  const openEdit = (blog=null) => {
    setForm(blog ? { ...blog, tags:(blog.tags||[]).join(", ") } : { title:"",slug:"",excerpt:"",featuredImage:"",category:"Other",tags:"",author:"",status:"draft",layout:"classic",accentColor:C.navy,blocks:[],seo:{} });
    setEditId(blog ? blog.id : "new");
    setView("edit");
  };

  const setF = (k,v) => setForm(p=>({...p,[k]:v}));
  const setFSeo = (k,v) => setForm(p=>({...p,seo:{...(p.seo||{}),[k]:v}}));

  const save = (status) => {
    const payload = { ...form, tags:(form.tags||"").split(",").map(t=>t.trim()).filter(Boolean), status:status||form.status, readingTime:readingTime(form.blocks) };
    if (status==="published" && !payload.publishDate) payload.publishDate = new Date().toISOString();
    if (editId==="new") addBlog(payload);
    else updateBlog(editId, payload);
    setView("list");
  };

  const filtered = blogs.filter(b=>filterStatus==="all"||b.status===filterStatus).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));

  const baseInput = { width:"100%", padding:"11px 14px", border:`1.5px solid ${C.navy}18`, borderRadius:10, fontFamily:"Nunito", fontSize:13.5, color:C.text, background:C.white, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };
  const onFocus = e=>e.target.style.borderColor=C.coral;
  const onBlur  = e=>e.target.style.borderColor=`${C.navy}18`;

  const STATUS_COLOR = { draft:C.muted, published:"#22C55E", scheduled:C.yellow };

  /* ── EDIT VIEW ── */
  if (view==="edit") return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <button onClick={()=>setView("list")} style={{ background:`${C.navy}10`, color:C.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"8px 16px", borderRadius:100 }}>← Back</button>
        <h2 style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", margin:0 }}>{editId==="new"?"New Post":"Edit Post"}</h2>
        <div style={{ marginLeft:"auto", display:"flex", gap:10 }}>
          <button onClick={()=>save("draft")} style={{ background:C.warmGray, color:C.muted, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:13, padding:"9px 20px", borderRadius:100 }}>Save Draft</button>
          <button onClick={()=>save("published")} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"9px 24px", borderRadius:100 }}>Publish</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:20, alignItems:"start" }}>
        {/* Main editor */}
        <div>
          <div style={{ background:C.white, borderRadius:16, padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:16 }}>
            <div style={{ marginBottom:14 }}>
              <input value={form.title} onChange={e=>{setF("title",e.target.value);if(!form.slug||editId==="new")setF("slug",slugify(e.target.value));}} placeholder="Post title…" style={{ ...baseInput, fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", border:"none", padding:"0", outline:"none", background:"transparent", boxShadow:"none" }} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:16, paddingBottom:12, borderBottom:`1px solid ${C.navy}08` }}>
              <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>Slug:</span>
              <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy }}>/blog/</span>
              <input value={form.slug} onChange={e=>setF("slug",e.target.value)} style={{ fontFamily:"Nunito", fontSize:12, color:C.navy, border:`1px solid ${C.navy}20`, borderRadius:6, padding:"3px 8px", outline:"none", background:"transparent" }} />
            </div>
            <BlockEditor blocks={form.blocks||[]} setBlocks={v=>setF("blocks",v)} />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Publish settings */}
          <div style={{ background:C.white, borderRadius:14, padding:"18px 18px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:12 }}>Publish Settings</div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:4 }}>Status</label>
              <select value={form.status} onChange={e=>setF("status",e.target.value)} style={{ ...baseInput, padding:"8px 10px", fontSize:12.5, cursor:"pointer" }}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:4 }}>Category</label>
              <select value={form.category} onChange={e=>setF("category",e.target.value)} style={{ ...baseInput, padding:"8px 10px", fontSize:12.5, cursor:"pointer" }}>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:10 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:4 }}>Author</label>
              <input value={form.author} onChange={e=>setF("author",e.target.value)} placeholder="Author name" style={{ ...baseInput, padding:"8px 10px", fontSize:12.5 }} />
            </div>
            <div>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:4 }}>Tags (comma separated)</label>
              <input value={form.tags} onChange={e=>setF("tags",e.target.value)} placeholder="Parenting, Quran, Lahore" style={{ ...baseInput, padding:"8px 10px", fontSize:12.5 }} />
            </div>
          </div>

          {/* Featured image */}
          <div style={{ background:C.white, borderRadius:14, padding:"18px 18px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:10 }}>Featured Image</div>
            <input value={form.featuredImage} onChange={e=>setF("featuredImage",e.target.value)} placeholder="https://… image URL" style={{ ...baseInput, padding:"8px 10px", fontSize:12 }} />
            {form.featuredImage && <div style={{ marginTop:10, height:120, borderRadius:10, overflow:"hidden", background:"#F5F5F5" }}><img src={form.featuredImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} /></div>}
          </div>

          {/* Excerpt */}
          <div style={{ background:C.white, borderRadius:14, padding:"18px 18px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:10 }}>Excerpt</div>
            <textarea value={form.excerpt} onChange={e=>setF("excerpt",e.target.value)} placeholder="Short summary shown in blog listing…" style={{ ...baseInput, minHeight:72, resize:"vertical", padding:"9px 12px", fontSize:12.5 }} />
          </div>

          {/* Design */}
          <div style={{ background:C.white, borderRadius:14, padding:"18px 18px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:10 }}>Post Design</div>
            {LAYOUTS.map(l=>(
              <button key={l.id} onClick={()=>setF("layout",l.id)} style={{ width:"100%", display:"flex", gap:10, padding:"10px 12px", marginBottom:6, border:`1.5px solid ${form.layout===l.id?C.navy:`${C.navy}15`}`, borderRadius:10, background:form.layout===l.id?`${C.navy}08`:"transparent", cursor:"pointer", textAlign:"left" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:form.layout===l.id?C.navy:C.text }}>{l.label}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{l.desc}</div>
                </div>
                {form.layout===l.id && <span style={{ color:C.navy }}>✓</span>}
              </button>
            ))}
            <div style={{ marginTop:8 }}>
              <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:4 }}>Accent Colour</label>
              <div style={{ display:"flex", gap:6 }}>
                <input type="color" value={form.accentColor||C.navy} onChange={e=>setF("accentColor",e.target.value)} style={{ width:40, height:32, border:"none", borderRadius:6, cursor:"pointer" }} />
                <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, alignSelf:"center" }}>{form.accentColor}</span>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div style={{ background:C.white, borderRadius:14, padding:"18px 18px", boxShadow:"0 2px 10px rgba(0,0,0,0.06)" }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:15, color:"#1a1a2e", marginBottom:10 }}>SEO</div>
            {[
              { k:"metaTitle",       ph:"SEO title (60 chars max)", lbl:"Meta Title" },
              { k:"metaDescription", ph:"Description (160 chars max)", lbl:"Meta Description", multiline:true },
              { k:"focusKeyword",    ph:"e.g. Islamic preschool Lahore", lbl:"Focus Keyword" },
            ].map(({ k,ph,lbl,multiline })=>(
              <div key={k} style={{ marginBottom:10 }}>
                <label style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:4 }}>{lbl}</label>
                {multiline
                  ? <textarea value={form.seo?.[k]||""} onChange={e=>setFSeo(k,e.target.value)} placeholder={ph} style={{ ...baseInput, minHeight:60, resize:"vertical", padding:"8px 10px", fontSize:12 }} />
                  : <input value={form.seo?.[k]||""} onChange={e=>setFSeo(k,e.target.value)} placeholder={ph} style={{ ...baseInput, padding:"8px 10px", fontSize:12 }} />
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── LIST VIEW ── */
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:"#1a1a2e", margin:"0 0 4px" }}>Blog Manager</h2>
          <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, margin:0 }}>{blogs.filter(b=>b.status==="published").length} published · {blogs.filter(b=>b.status==="draft").length} drafts</p>
        </div>
        <button onClick={()=>openEdit(null)} style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"10px 22px", borderRadius:100, boxShadow:`0 4px 14px ${C.navy}35` }}>+ New Post</button>
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["all","published","draft","scheduled"].map(s=>(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{ padding:"7px 16px", borderRadius:100, border:`1.5px solid ${filterStatus===s?C.navy:`${C.navy}18`}`, background:filterStatus===s?C.navy:"transparent", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, color:filterStatus===s?C.white:C.muted, textTransform:"capitalize" }}>{s} {s==="all"?`(${blogs.length})`:s==="published"?`(${blogs.filter(b=>b.status==="published").length})`:s==="draft"?`(${blogs.filter(b=>b.status==="draft").length})`:""}</button>
        ))}
      </div>

      {filtered.length===0 ? (
        <div style={{ background:C.white, borderRadius:18, padding:"64px 24px", textAlign:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:44, marginBottom:12 }}>📝</div>
          <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>No posts yet</div>
          <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, maxWidth:360, margin:"0 auto 20px" }}>Write your first blog post — share knowledge about Islamic parenting, child development, or school news.</p>
          <button onClick={()=>openEdit(null)} style={{ background:C.navy, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:13, padding:"11px 24px", borderRadius:100 }}>Write First Post</button>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
          {filtered.map(post=>(
            <div key={post.id} style={{ background:C.white, borderRadius:18, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", border:`1px solid ${C.navy}08` }}>
              {post.featuredImage && <div style={{ height:140, overflow:"hidden", background:"#F5F5F5" }}><img src={post.featuredImage} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} /></div>}
              <div style={{ padding:"18px 18px" }}>
                <div style={{ display:"flex", gap:6, marginBottom:8, alignItems:"center" }}>
                  <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", background:`${STATUS_COLOR[post.status]||C.muted}18`, color:STATUS_COLOR[post.status]||C.muted, padding:"2px 8px", borderRadius:100 }}>{post.status}</span>
                  <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted }}>{post.category}</span>
                  <span style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginLeft:"auto" }}>{post.readingTime||1} min</span>
                </div>
                <div style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e", marginBottom:6, lineHeight:1.3 }}>{post.title||"Untitled"}</div>
                <p style={{ fontFamily:"Nunito", fontSize:12.5, color:C.muted, lineHeight:1.6, margin:"0 0 12px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{post.excerpt||"No excerpt."}</p>
                <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, marginBottom:12 }}>{fmt(post.publishDate||post.createdAt)} {post.author && `· ${post.author}`}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={()=>openEdit(post)} style={{ flex:1, background:`${C.navy}10`, color:C.navy, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px", borderRadius:100 }}>Edit</button>
                  {post.status==="draft" && <button onClick={()=>updateBlog(post.id,{status:"published",publishDate:new Date().toISOString()})} style={{ flex:1, background:`${C.mint}18`, color:C.mint, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px", borderRadius:100 }}>Publish</button>}
                  {post.status==="published" && <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" style={{ flex:1, background:`${C.mint}10`, color:C.mint, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px", borderRadius:100, textDecoration:"none", textAlign:"center" }}>↗ View</a>}
                  <button onClick={()=>setConfirmDel(post.id)} style={{ background:`${C.coral}10`, color:C.coral, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 12px", borderRadius:100 }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDel && (
        <>
          <div onClick={()=>setConfirmDel(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", background:C.white, borderRadius:20, padding:"32px 28px", width:"min(360px,90vw)", zIndex:401, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:20, color:"#1a1a2e", marginBottom:8 }}>Delete this post?</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{deleteBlog(confirmDel);setConfirmDel(null);}} style={{ flex:1, background:C.coral, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"12px", borderRadius:100 }}>Delete</button>
              <button onClick={()=>setConfirmDel(null)} style={{ flex:1, background:C.warmGray, color:C.text, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px", borderRadius:100 }}>Cancel</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
