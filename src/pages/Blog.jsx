import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { C } from "../constants/theme";

const CATEGORIES = ["All","Islamic Education","Parenting","Child Development","Montessori","Reggio Emilia","Waldorf","Motherhood"];

export default function Blog() {
  const { blogs } = useAdmin();
  const published = blogs.filter(b => b.status === "published").sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = published.filter(b => {
    const matchCat = activeCat === "All" || b.category === activeCat;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || (b.excerpt||"").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <main style={{ minHeight:"100vh", background:"#FAFBFF" }}>
        {/* Header */}
        <section style={{ background:`linear-gradient(135deg,${C.navy} 0%,#2d51b8 100%)`, padding:"72px 24px 56px", textAlign:"center" }}>
          <div style={{ maxWidth:640, margin:"0 auto" }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:"rgba(255,255,255,0.6)",
              textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:12 }}>Mini Muslims Nest</div>
            <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(2rem,5vw,3rem)", color:C.white,
              margin:"0 0 16px", lineHeight:1.2 }}>Our Blog</h1>
            <p style={{ fontFamily:"Nunito", fontSize:16, color:"rgba(255,255,255,0.8)", margin:"0 0 28px", lineHeight:1.7 }}>
              Thoughts on Islamic parenting, child-led learning, and raising confident Muslim children.
            </p>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles…"
              style={{ width:"100%", maxWidth:400, padding:"13px 20px", borderRadius:100, border:"none",
                fontFamily:"Nunito", fontSize:14, color:C.text, outline:"none", boxSizing:"border-box" }} />
          </div>
        </section>

        {/* Category tabs */}
        <div style={{ background:C.white, borderBottom:`1px solid ${C.navy}10`, overflowX:"auto" }}>
          <div style={{ display:"flex", gap:4, padding:"12px 24px", maxWidth:1100, margin:"0 auto", minWidth:"max-content" }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={()=>setActiveCat(cat)}
                style={{ padding:"7px 16px", borderRadius:100, border:"none", cursor:"pointer",
                  fontFamily:"Nunito", fontWeight:700, fontSize:12.5, whiteSpace:"nowrap",
                  background:activeCat===cat?C.navy:"transparent",
                  color:activeCat===cat?C.white:C.muted }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 24px" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📝</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:22, color:"#1a1a2e", marginBottom:8 }}>
                {published.length === 0 ? "No Posts Yet" : "No Matching Posts"}
              </div>
              <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted }}>
                {published.length === 0 ? "Check back soon — articles are on their way." : "Try a different category or search term."}
              </p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <Link to={`/blog/${featured.slug}`} style={{ textDecoration:"none", display:"block", marginBottom:40 }}>
                  <div style={{ background:C.white, borderRadius:20, overflow:"hidden",
                    boxShadow:"0 4px 24px rgba(0,0,0,0.08)", display:"grid",
                    gridTemplateColumns:"1fr 1fr", transition:"transform 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                    <div style={{ minHeight:280, background:`${C.navy}18`, overflow:"hidden" }}>
                      {featured.featuredImage
                        ? <img src={featured.featuredImage} alt={featured.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : <div style={{ width:"100%", height:"100%", minHeight:280, background:`linear-gradient(135deg,${C.navy}18,${C.coral}18)`,
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:64 }}>📖</div>
                      }
                    </div>
                    <div style={{ padding:"36px 36px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, background:`${C.coral}18`,
                          color:C.coral, padding:"3px 10px", borderRadius:100 }}>Featured</span>
                        {featured.category && <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11,
                          background:`${C.navy}10`, color:C.navy, padding:"3px 10px", borderRadius:100 }}>{featured.category}</span>}
                      </div>
                      <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(1.3rem,2.5vw,1.8rem)", color:"#1a1a2e",
                        margin:"0 0 12px", lineHeight:1.3 }}>{featured.title}</h2>
                      {featured.excerpt && <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted,
                        margin:"0 0 20px", lineHeight:1.7 }}>{featured.excerpt}</p>}
                      <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                        <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>
                          {new Date(featured.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
                        </span>
                        {featured.readingTime && <span style={{ fontFamily:"Nunito", fontSize:12, color:C.muted }}>{featured.readingTime} min read</span>}
                      </div>
                      <div style={{ marginTop:20, fontFamily:"Nunito", fontWeight:700, fontSize:13, color:C.navy }}>Read article →</div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:24 }}>
                  {rest.map(post => (
                    <Link key={post.id} to={`/blog/${post.slug}`} style={{ textDecoration:"none" }}>
                      <article style={{ background:C.white, borderRadius:16, overflow:"hidden",
                        boxShadow:"0 2px 12px rgba(0,0,0,0.06)", height:"100%", display:"flex", flexDirection:"column",
                        transition:"transform 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
                        onMouseLeave={e=>e.currentTarget.style.transform="none"}>
                        <div style={{ height:180, background:`${C.navy}10`, overflow:"hidden", flexShrink:0 }}>
                          {post.featuredImage
                            ? <img src={post.featuredImage} alt={post.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            : <div style={{ width:"100%", height:"100%", background:`linear-gradient(135deg,${C.navy}18,${C.coral}18)`,
                                display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>📖</div>
                          }
                        </div>
                        <div style={{ padding:"20px 22px", flex:1, display:"flex", flexDirection:"column" }}>
                          {post.category && (
                            <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10.5, background:`${C.navy}10`,
                              color:C.navy, padding:"2px 9px", borderRadius:100, alignSelf:"flex-start", marginBottom:10 }}>
                              {post.category}
                            </span>
                          )}
                          <h3 style={{ fontFamily:"Fredoka One", fontSize:17, color:"#1a1a2e",
                            margin:"0 0 8px", lineHeight:1.3 }}>{post.title}</h3>
                          {post.excerpt && (
                            <p style={{ fontFamily:"Nunito", fontSize:13, color:C.muted,
                              margin:"0 0 auto", lineHeight:1.6, display:"-webkit-box",
                              WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{post.excerpt}</p>
                          )}
                          <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:14, paddingTop:14,
                            borderTop:`1px solid ${C.navy}08` }}>
                            <span style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted }}>
                              {new Date(post.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                            </span>
                            {post.readingTime && <span style={{ fontFamily:"Nunito", fontSize:11.5, color:C.muted }}>{post.readingTime} min</span>}
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
    </main>
  );
}
