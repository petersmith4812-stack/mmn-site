import { useState } from "react";
import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";
import { useSiteContent } from "../../context/SiteContentContext";

const Vision = () => {
  const { content } = useSiteContent();
  const v = content.homeVision || {};
  const pillars = Array.isArray(content.homeVisionPillars) && content.homeVisionPillars.length
    ? content.homeVisionPillars
    : [];
  const [active, setActive] = useState(0);

  return (
    <section id="vision" data-mmn="home-vision" style={{
      background: `linear-gradient(180deg, ${C.cream} 0%, ${C.warmGray} 100%)`,
      padding:"110px 6vw", position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:60, left:"5%", width:280, height:280,
        background:`radial-gradient(circle, ${C.coral}15 0%, transparent 70%)`,
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute", bottom:60, right:"5%", width:280, height:280,
        background:`radial-gradient(circle, ${C.mint}18 0%, transparent 70%)`,
        pointerEvents:"none",
      }}/>

      <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:14 }}>
              {v.badge || "⊹ A New Kind of School ⊹"}
            </div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(28px,4.5vw,52px)", color:C.navy, lineHeight:1.12, margin:"0 0 18px" }}>
              {v.heading1 || "This Is Not Just a School."}<br/>
              <span style={{
                background: `linear-gradient(90deg, ${C.coral}, ${C.yellow}, ${C.mint})`,
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text",
                WebkitTextFillColor:"transparent",
                backgroundClip:"text",
                animation:"shimmer 4s linear infinite",
              }}>{v.heading2 || "This Is a Vision."}</span>
            </h2>
            <RainbowDivider />
            <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,19px)", color:C.muted, maxWidth:660, margin:"0 auto", lineHeight:1.85 }}>
              {v.subQuote || "And like every vision worth building — it will take a great deal of courage, trust, and intent — from us, and from you."}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:32, flexWrap:"wrap" }}>
            {pillars.map((p, i) => (
              <button key={p.word} onClick={()=>setActive(i)} style={{
                background: active === i ? p.color : C.white,
                color: active === i ? C.white : p.color,
                border:`2px solid ${p.color}`,
                fontFamily:"Nunito", fontWeight:800, fontSize:13,
                padding:"10px 22px", borderRadius:100,
                letterSpacing:"0.08em", textTransform:"uppercase",
                cursor:"pointer", transition:"all 0.25s ease",
                boxShadow: active === i ? `0 6px 18px ${p.color}45` : "none",
              }}>{p.letter} · {p.word}</button>
            ))}
          </div>
        </FadeIn>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:22 }}>
          {pillars.map((p, i) => (
            <FadeIn key={p.word} delay={0.08 * i}>
              <TiltCard
                onClick={()=>setActive(i)}
                style={{
                  background: active === i ? `linear-gradient(160deg, ${p.color} 0%, ${p.color}dd 100%)` : C.white,
                  color: active === i ? C.white : C.text,
                  borderRadius:24, padding:"32px 28px",
                  border:`2px solid ${p.color}${active === i ? "" : "22"}`,
                  boxShadow: active === i ? `0 18px 40px ${p.color}40` : "0 4px 16px rgba(0,0,0,0.05)",
                  cursor:"pointer", minHeight: 280,
                  transition:"background 0.4s ease, color 0.4s ease, box-shadow 0.4s ease",
                }}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                  <div style={{
                    width:54, height:54, borderRadius:16,
                    background: active === i ? "rgba(255,255,255,0.22)" : `${p.color}15`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontFamily:"Fredoka One", fontSize:26,
                    color: active === i ? C.white : p.color,
                  }}>{p.letter}</div>
                  <div style={{ fontSize:32, opacity: active === i ? 1 : 0.6 }}>{p.symbol}</div>
                </div>
                <div style={{ fontFamily:"Fredoka One", fontSize:26, color: active === i ? C.white : p.color, marginBottom:8 }}>{p.word}</div>
                <div style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:13.5, color: active === i ? "rgba(255,255,255,0.85)" : C.muted, marginBottom:14, lineHeight:1.5 }}>{p.tagline}</div>
                <p style={{ fontFamily:"Nunito", fontSize:14, lineHeight:1.75, color: active === i ? "rgba(255,255,255,0.92)" : C.text, margin:0 }}>{p.body}</p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div style={{
            marginTop:56, padding:"32px 36px", textAlign:"center",
            background: C.white, borderRadius:24,
            border:`2px dashed ${C.yellow}80`,
            maxWidth:780, marginLeft:"auto", marginRight:"auto",
          }}>
            <div style={{ fontFamily:"Fredoka One", fontSize:"clamp(18px,2.5vw,24px)", color:C.navy, lineHeight:1.45, margin:"0 0 10px" }}>
              {v.bottomQuote || "This is the first school of its kind — where mothers do not leave at the gate."}
            </div>
            <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, lineHeight:1.75, margin:0 }}>
              {v.bottomBody || "They walk in, sit in, and grow in."}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default Vision;
