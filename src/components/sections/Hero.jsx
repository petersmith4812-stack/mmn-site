import { useState, useRef } from "react";
import { C } from "../../constants/theme";
import Logo from "../ui/Logo";
import AnimatedCounter from "../ui/AnimatedCounter";
import { useSiteContent } from "../../context/SiteContentContext";

const Hero = () => {
  const { content } = useSiteContent();
  const h = content.homeHero || {};
  const stats = Array.isArray(content.homeHeroStats) ? content.homeHeroStats : [];
  const sectionRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section
      id="hero"
      data-mmn="home-hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight:"100vh", background: C.cream,
        display:"flex", alignItems:"center",
        padding:"120px 6vw 80px",
        position:"relative", overflow:"hidden",
      }}>

      {/* ── Background effects ── */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background: `radial-gradient(circle 600px at ${mouse.x}% ${mouse.y}%, rgba(240,135,106,0.10), transparent 65%)`,
        transition: "background 0.2s ease-out",
      }}/>
      <div style={{
        position:"absolute", top:-80, right:-80, width:500, height:500,
        background:"radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 70%)",
        pointerEvents:"none",
      }}/>
      <div style={{
        position:"absolute", bottom:-40, left:-60, width:400, height:400,
        background:"radial-gradient(circle, rgba(75,174,149,0.1) 0%, transparent 70%)",
        pointerEvents:"none",
      }}/>
      {C.rainbow.map((c, i) => (
        <div key={i} style={{
          position:"absolute",
          width: [10,14,8,12,10,16][i], height:[10,14,8,12,10,16][i],
          borderRadius:"50%", background: c, opacity: 0.35,
          top: ["15%","75%","25%","85%","10%","60%"][i],
          right: ["8%","12%","5%","18%","20%","6%"][i],
          animation: `float${i} ${[6,8,7,9,6.5,8.5][i]}s ease-in-out infinite`,
        }}/>
      ))}

      <style>{`
        ${C.rainbow.map((_,i)=>`@keyframes float${i}{0%,100%{transform:translateY(0px)}50%{transform:translateY(${[-12,10,-8,14,-10,12][i]}px)}}`).join("")}
        @keyframes floatV0{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes floatV1{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}
        @keyframes floatV2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes floatV3{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
        @keyframes floatVb{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}
        @media (max-width:900px){.mmn-hero-visual{display:none!important}}
      `}</style>

      <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", display:"flex", alignItems:"center", gap:60, position:"relative", zIndex:2 }}>

        {/* ── LEFT: text content ── */}
        <div style={{ flex:"1 1 0", minWidth:0, display:"flex", flexDirection:"column", gap:8 }}>

          <div style={{
            display:"inline-flex", alignSelf:"flex-start", alignItems:"center", gap:8,
            background: `linear-gradient(135deg, ${C.coral}, ${C.yellow})`,
            color: C.white, fontFamily:"Nunito", fontWeight:800,
            fontSize:11, letterSpacing:"0.14em", padding:"7px 16px",
            borderRadius:100, textTransform:"uppercase",
            animation:"pulseHeart 2.6s ease-in-out infinite",
            marginBottom:16,
          }}>
            <span style={{ fontSize:14 }}>{h.badgeIcon || "✨"}</span>
            {h.badge || "Pakistan's First Mommy-Inclusive Preschool"}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <Logo size={56} />
            <div style={{
              background: `linear-gradient(135deg, ${C.yellow}, ${C.coral})`,
              color: C.white, fontFamily:"Nunito", fontWeight:800,
              fontSize:11, letterSpacing:"0.12em", padding:"5px 14px",
              borderRadius:100, textTransform:"uppercase",
            }}>{h.brandTag || "Since 2024 · Lahore"}</div>
          </div>

          <h1 style={{
            fontFamily:"Fredoka One", fontSize:"clamp(38px,6.5vw,78px)",
            color: C.navy, lineHeight:1.1, margin:0, maxWidth:780,
          }}>
            {h.headingLine1 || "Where Roots"}<br/>
            <span style={{ color: C.coral }}>{h.headingLine2 || "Grow Deeper"}</span><br/>
            {h.headingLine3 || "Than Grades."}
          </h1>

          <p style={{
            fontFamily:"Lora", fontStyle:"italic",
            fontSize:"clamp(15px,2vw,19px)", color: C.muted,
            maxWidth:620, lineHeight:1.75, margin:"20px 0 0",
          }}>
            {h.subPara1 || "The first school of its kind — where mothers stay alongside their children, growing together."}
          </p>

          <p style={{
            fontFamily:"Nunito", fontWeight:700,
            fontSize:"clamp(13px,1.6vw,15px)", color: C.mint,
            letterSpacing:"0.06em", margin:"8px 0 0", textTransform:"uppercase",
          }}>
            {h.tagline || "Reggio Emilia · Waldorf · Montessori · Islamic Foundation"}
          </p>

          <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginTop:32 }}>
            <button
              onClick={()=>document.getElementById("enrol")?.scrollIntoView({behavior:"smooth"})}
              style={{
                background: C.navy, color: C.white,
                fontFamily:"Nunito", fontWeight:800, fontSize:15,
                padding:"16px 36px", borderRadius:100, border:"none", cursor:"pointer",
                boxShadow:"0 6px 24px rgba(27,63,139,0.3)",
                transition:"transform 0.2s, box-shadow 0.2s", letterSpacing:"0.03em",
              }}
              onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(27,63,139,0.35)"}}
              onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 6px 24px rgba(27,63,139,0.3)"}}
            >{h.cta1Text || "Book a Visit"}</button>

            <button
              onClick={()=>document.getElementById("vision")?.scrollIntoView({behavior:"smooth"})}
              style={{
                background:"transparent", color: C.navy,
                fontFamily:"Nunito", fontWeight:700, fontSize:15,
                padding:"16px 36px", borderRadius:100,
                border:`2.5px solid ${C.navy}`, cursor:"pointer", transition:"all 0.2s",
              }}
              onMouseOver={e=>{e.currentTarget.style.background=C.navy;e.currentTarget.style.color=C.white}}
              onMouseOut={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.navy}}
            >{h.cta2Text || "See the Vision →"}</button>
          </div>

          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:40 }}>
            {stats.map(({ number, suffix, label }) => (
              <div key={label} style={{
                background: C.white, border:`1.5px solid #E8E4DC`,
                borderRadius:16, padding:"10px 20px", textAlign:"center",
                boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
                transition:"transform 0.2s, box-shadow 0.2s", cursor:"default",
              }}
                onMouseOver={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(0,0,0,0.08)"}}
                onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.05)"}}
              >
                <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.navy }}>
                  <AnimatedCounter value={number} suffix={suffix} />
                </div>
                <div style={{ fontFamily:"Nunito", fontSize:11, color:C.muted, letterSpacing:"0.06em", textTransform:"uppercase" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop:48, display:"flex", alignItems:"center", gap:10,
            fontFamily:"Nunito", fontSize:11, color:C.muted, letterSpacing:"0.15em", textTransform:"uppercase",
            animation:"bobble 2.4s ease-in-out infinite",
          }}>
            <div style={{ width:24, height:1.5, background:C.muted }}/>
            {h.scrollLabel || "Scroll to begin the journey"}
          </div>
        </div>

        {/* ── RIGHT: hero visual ── */}
        <div className="mmn-hero-visual" style={{ flex:"0 0 400px", position:"relative", height:520, alignSelf:"center" }}>

          {/* Soft glow behind central card */}
          <div style={{
            position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
            width:340, height:340, borderRadius:"50%",
            background:`radial-gradient(circle, ${C.coral}1a 0%, transparent 70%)`,
            pointerEvents:"none",
          }}/>

          {/* ── Central school identity card ── */}
          <div style={{
            position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
            width:230, background:`linear-gradient(160deg,${C.navy} 0%,#162d6b 100%)`,
            borderRadius:28, padding:"32px 22px",
            boxShadow:"0 28px 64px rgba(27,63,139,0.40)",
            zIndex:3, textAlign:"center", overflow:"hidden",
          }}>
            {/* Decorative rings inside card */}
            <div style={{ position:"absolute", top:-50, right:-50, width:160, height:160, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.06)", pointerEvents:"none" }}/>
            <div style={{ position:"absolute", bottom:-50, left:-50, width:140, height:140, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.04)", pointerEvents:"none" }}/>

            <div style={{ fontSize:44, marginBottom:12 }}>🌙</div>
            <div style={{ fontFamily:"Fredoka One", fontSize:17, color:C.white, marginBottom:4, lineHeight:1.2 }}>Mini Muslims Nest</div>
            <div style={{ fontFamily:"Nunito", fontSize:9.5, color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>Islamic Preschool · Lahore</div>

            <div style={{ display:"flex", gap:4, justifyContent:"center", flexWrap:"wrap", marginBottom:18 }}>
              {["Teaching","Tarbiyah","Transformation","Tadabbur"].map(t=>(
                <span key={t} style={{ background:"rgba(255,255,255,0.09)", borderRadius:7, padding:"3px 8px", fontFamily:"Nunito", fontWeight:700, fontSize:9, color:"rgba(255,255,255,0.65)", letterSpacing:"0.04em" }}>{t}</span>
              ))}
            </div>

            <div style={{ background:`${C.yellow}28`, borderRadius:10, padding:"7px 12px", display:"inline-flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12 }}>🕙</span>
              <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:11, color:C.yellow }}>10 am – 2 pm</span>
            </div>
          </div>

          {/* ── Floating mini-cards ── */}
          {[
            { icon:"🌸", title:"Circle Time",   sub:"Mothers & kids together", color:C.coral,   pos:{ top:60,    left:0    }, anim:"floatV0", dur:"6s"  },
            { icon:"📖", title:"Quran Daily",   sub:"Woven into every moment", color:"#7c5cbf", pos:{ top:40,    right:0   }, anim:"floatV1", dur:"8s"  },
            { icon:"🌿", title:"Active Breaks", sub:"Play built in",           color:C.mint,    pos:{ bottom:90, left:8    }, anim:"floatV2", dur:"7s"  },
            { icon:"🤝", title:"Mothers Stay",  sub:"First of its kind",       color:C.yellow,  pos:{ bottom:70, right:8   }, anim:"floatV3", dur:"9s"  },
          ].map(({ icon, title, sub, color, pos, anim, dur }) => (
            <div key={title} style={{
              position:"absolute", ...pos,
              background:C.white, borderRadius:14, padding:"10px 13px",
              boxShadow:"0 8px 24px rgba(0,0,0,0.10)",
              borderLeft:`4px solid ${color}`,
              zIndex:4, animation:`${anim} ${dur} ease-in-out infinite`,
              minWidth:158,
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <span style={{ fontSize:18 }}>{icon}</span>
                <div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:12.5, color:C.navy, lineHeight:1.2 }}>{title}</div>
                  <div style={{ fontFamily:"Nunito", fontSize:10.5, color:C.muted, lineHeight:1.3 }}>{sub}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Ages badge floating at top */}
          <div style={{
            position:"absolute", top:8, left:"50%",
            background:`linear-gradient(135deg,${C.coral},${C.yellow})`,
            borderRadius:100, padding:"5px 16px", zIndex:5,
            boxShadow:`0 4px 16px ${C.coral}50`,
            animation:"floatVb 7s ease-in-out infinite",
          }}>
            <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:11, color:C.white, whiteSpace:"nowrap" }}>✦ Ages 4–7 · Lahore ✦</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
