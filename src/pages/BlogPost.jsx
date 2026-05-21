import { useParams, Link } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { C } from "../constants/theme";

function BlockRenderer({ block }) {
  const base = { fontFamily:"Nunito", fontSize:17, color:"#2d2d3a", lineHeight:1.8 };

  switch (block.type) {
    case "heading": {
      const Tag = block.level || "h2";
      const sizes = { h1:32, h2:26, h3:21 };
      return <Tag style={{ fontFamily:"Fredoka One", fontSize:sizes[Tag]||26, color:"#1a1a2e",
        margin:"36px 0 12px", lineHeight:1.3 }}>{block.text}</Tag>;
    }
    case "paragraph":
      return <p style={{ ...base, margin:"0 0 24px" }} dangerouslySetInnerHTML={{ __html: block.text }} />;

    case "image":
      return (
        <figure style={{ margin:"36px 0" }}>
          <img src={block.url} alt={block.alt||""} style={{ width:"100%", borderRadius:14,
            boxShadow:"0 4px 20px rgba(0,0,0,0.1)", display:"block" }} />
          {block.caption && <figcaption style={{ fontFamily:"Nunito", fontSize:13, color:C.muted,
            textAlign:"center", marginTop:10, fontStyle:"italic" }}>{block.caption}</figcaption>}
        </figure>
      );

    case "quote":
      return (
        <blockquote style={{ margin:"36px 0", padding:"24px 28px", background:`${C.navy}06`,
          borderLeft:`4px solid ${C.navy}`, borderRadius:"0 14px 14px 0" }}>
          <p style={{ fontFamily:"Nunito", fontSize:18, color:C.navy, fontStyle:"italic",
            margin:"0 0 8px", lineHeight:1.7 }}>"{block.text}"</p>
          {block.author && <cite style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13,
            color:C.muted, fontStyle:"normal" }}>— {block.author}</cite>}
        </blockquote>
      );

    case "list":
      return block.style === "numbered"
        ? <ol style={{ ...base, paddingLeft:28, margin:"0 0 24px" }}>{(block.items||[]).map((item,i)=><li key={i} style={{ marginBottom:8 }}>{item}</li>)}</ol>
        : <ul style={{ ...base, paddingLeft:24, margin:"0 0 24px" }}>{(block.items||[]).map((item,i)=><li key={i} style={{ marginBottom:8 }}>{item}</li>)}</ul>;

    case "callout":
      return (
        <div style={{ margin:"28px 0", padding:"18px 22px", background:`${block.color||C.coral}18`,
          border:`1.5px solid ${block.color||C.coral}30`, borderRadius:14,
          fontFamily:"Nunito", fontSize:15, color:"#1a1a2e", lineHeight:1.7 }}>
          {block.text}
        </div>
      );

    case "divider":
      return <hr style={{ border:"none", borderTop:`2px solid ${C.navy}10`, margin:"40px 0" }} />;

    case "html":
      return <div dangerouslySetInnerHTML={{ __html: block.html }} style={{ margin:"0 0 24px" }} />;

    default:
      return null;
  }
}

export default function BlogPost() {
  const { slug } = useParams();
  const { blogs } = useAdmin();
  const post = blogs.find(b => b.slug === slug && b.status === "published");

  if (!post) return (
    <main style={{ minHeight:"60vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:"60px 24px", background:"#FAFBFF" }}>
      <div style={{ fontSize:56, marginBottom:16 }}>📄</div>
      <h1 style={{ fontFamily:"Fredoka One", fontSize:28, color:"#1a1a2e", margin:"0 0 12px" }}>Post Not Found</h1>
      <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, marginBottom:24 }}>
        This post may have been moved or is no longer published.
      </p>
      <Link to="/blog" style={{ background:`linear-gradient(135deg,${C.navy},#2d51b8)`, color:C.white,
        textDecoration:"none", fontFamily:"Nunito", fontWeight:700, fontSize:14,
        padding:"12px 28px", borderRadius:100 }}>← Back to Blog</Link>
    </main>
  );

  const isFullWidth = post.layout === "full-width";
  const isMagazine = post.layout === "magazine";
  const blocks = post.blocks || [];
  const contentBlocks = isMagazine ? blocks.slice(0, Math.ceil(blocks.length / 2)) : blocks;
  const sideBlocks = isMagazine ? blocks.slice(Math.ceil(blocks.length / 2)) : [];

  return (
    <main style={{ background:"#FAFBFF", minHeight:"100vh" }}>
        {/* Hero */}
        <header style={{ background:`linear-gradient(135deg,${C.navy} 0%,#2d51b8 100%)`,
          padding:"64px 24px 48px" }}>
          <div style={{ maxWidth: isFullWidth ? 1100 : 760, margin:"0 auto" }}>
            <Link to="/blog" style={{ fontFamily:"Nunito", fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.7)",
              textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6, marginBottom:20 }}>
              ← Blog
            </Link>
            {post.category && (
              <div style={{ marginBottom:14 }}>
                <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11.5, background:"rgba(255,255,255,0.15)",
                  color:C.white, padding:"4px 14px", borderRadius:100 }}>{post.category}</span>
              </div>
            )}
            <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(1.6rem,4vw,2.6rem)", color:C.white,
              margin:"0 0 16px", lineHeight:1.25 }}>{post.title}</h1>
            {post.excerpt && <p style={{ fontFamily:"Nunito", fontSize:16, color:"rgba(255,255,255,0.8)",
              margin:"0 0 20px", lineHeight:1.7 }}>{post.excerpt}</p>}
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              <span style={{ fontFamily:"Nunito", fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                {new Date(post.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
              </span>
              {post.readingTime && <span style={{ fontFamily:"Nunito", fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                {post.readingTime} min read
              </span>}
            </div>
          </div>
        </header>

        {/* Featured image */}
        {post.featuredImage && (
          <div style={{ maxWidth: isFullWidth ? 1100 : 760, margin:"-32px auto 0", padding:"0 24px" }}>
            <img src={post.featuredImage} alt={post.title}
              style={{ width:"100%", borderRadius:16, boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
                display:"block", maxHeight:480, objectFit:"cover" }} />
          </div>
        )}

        {/* Content */}
        <div style={{ maxWidth: isFullWidth ? 1100 : 760, margin:"0 auto", padding:"48px 24px 64px" }}>
          {isMagazine ? (
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:48 }}>
              <div>{contentBlocks.map((b,i)=><BlockRenderer key={i} block={b}/>)}</div>
              <aside style={{ paddingTop:8 }}>{sideBlocks.map((b,i)=><BlockRenderer key={i} block={b}/>)}</aside>
            </div>
          ) : (
            <div>{blocks.map((b,i)=><BlockRenderer key={i} block={b}/>)}</div>
          )}

          {/* Footer nav */}
          <div style={{ marginTop:56, paddingTop:32, borderTop:`2px solid ${C.navy}10`,
            display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
            <Link to="/blog" style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14, color:C.navy, textDecoration:"none" }}>
              ← All Articles
            </Link>
            <div style={{ display:"flex", gap:12 }}>
              <span style={{ fontFamily:"Nunito", fontSize:13, color:C.muted, alignSelf:"center" }}>Share:</span>
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
                target="_blank" rel="noreferrer"
                style={{ background:"#25D366", color:C.white, textDecoration:"none",
                  fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 16px", borderRadius:100 }}>
                WhatsApp
              </a>
              <button onClick={()=>navigator.clipboard.writeText(window.location.href)}
                style={{ background:`${C.navy}10`, color:C.navy, border:"none", cursor:"pointer",
                  fontFamily:"Nunito", fontWeight:700, fontSize:12, padding:"8px 16px", borderRadius:100 }}>
                Copy Link
              </button>
            </div>
          </div>
        </div>
    </main>
  );
}
