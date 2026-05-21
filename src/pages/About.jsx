import { Link } from "react-router-dom";
import { C } from "../constants/theme";
import { useSiteContent } from "../context/SiteContentContext";
import FadeIn from "../components/ui/FadeIn";
import TiltCard from "../components/ui/TiltCard";
import RainbowDivider from "../components/ui/RainbowDivider";

const About = () => {
  const { content } = useSiteContent();
  const a = content.about || {};
  const VALUES = Array.isArray(content.aboutValues) ? content.aboutValues : [];
  const DIFFERENCES = Array.isArray(content.aboutDifferences) ? content.aboutDifferences : [];

  return (
    <div style={{ paddingTop: 72 }}>
      {/* ── Hero ── */}
      <section data-mmn="about-hero" style={{
        background: `linear-gradient(160deg,${C.navy} 0%,#0f2a70 100%)`,
        padding: "100px 6vw 90px", position: "relative", overflow: "hidden",
        minHeight: "52vh", display: "flex", alignItems: "center",
      }}>
        <div style={{ position:"absolute", top:-100, right:-100, width:500, height:500, borderRadius:"50%", background:`${C.yellow}12`, pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-80, left:-80, width:400, height:400, borderRadius:"50%", background:`${C.coral}10`, pointerEvents:"none" }}/>
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${C.yellow}22`, border:`1px solid ${C.yellow}50`, color:C.yellow, fontFamily:"Nunito", fontWeight:700, fontSize:11, letterSpacing:"0.15em", padding:"6px 16px", borderRadius:100, textTransform:"uppercase", marginBottom:20 }}>
            {a.heroBadge}
          </div>
          <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(32px,5vw,62px)", color:C.white, lineHeight:1.1, margin:"0 0 22px", maxWidth:680 }}>
            {a.heroHeading.split("Courage.").map((part,i,arr) => i === arr.length-1 ? <span key={i}>{part}</span> : <span key={i}>{part}<span style={{color:C.yellow}}>Courage.</span></span>)}
          </h1>
          <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,19px)", color:"rgba(255,255,255,0.8)", maxWidth:620, lineHeight:1.82, margin:0 }}>
            {a.heroSub}
          </p>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section data-mmn="about-story" style={{ background:C.cream, padding:"100px 6vw" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:60, alignItems:"center" }}>
          <FadeIn>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:14 }}>Why We Started</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,42px)", color:C.navy, margin:"0 0 24px", lineHeight:1.15 }}>
              {a.storyHeading.includes("Built It") ? (
                <>{a.storyHeading.replace(" So We Built It.","")}<br/><span style={{color:C.coral}}>So We Built It.</span></>
              ) : a.storyHeading}
            </h2>
            <RainbowDivider />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p style={{ fontFamily:"Nunito", fontSize:"clamp(14px,1.7vw,16px)", color:C.text, lineHeight:2, marginBottom:20 }}>{a.storyBody1}</p>
            <p style={{ fontFamily:"Nunito", fontSize:"clamp(14px,1.7vw,16px)", color:C.text, lineHeight:2, marginBottom:24 }}>{a.storyBody2}</p>
            <div style={{ borderLeft:`4px solid ${C.coral}`, paddingLeft:20 }}>
              <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:17, color:C.coral, lineHeight:1.8, margin:0 }}>
                "If the school doesn't exist — we build it."
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── What Makes Us Different ── */}
      <section data-mmn="about-different" style={{ background:C.warmGray, padding:"100px 6vw" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.mint, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>What Sets Us Apart</div>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 16px" }}>What Makes Us Different.</h2>
              <RainbowDivider />
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
            {DIFFERENCES.map(({ icon, title, body }, i) => (
              <FadeIn key={title} delay={i * 0.06}>
                <TiltCard maxTilt={4} style={{ background:C.white, borderRadius:20, padding:"26px 22px", boxShadow:"0 4px 16px rgba(0,0,0,0.05)", border:`1.5px solid ${C.navy}10` }}>
                  <div style={{ fontSize:30, marginBottom:12 }}>{icon}</div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.navy, marginBottom:10 }}>{title}</div>
                  <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Values ── */}
      <section data-mmn="about-values" style={{ background:C.navy, padding:"100px 6vw" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.yellow, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>What We Stand For</div>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.white, margin:"0 0 16px" }}>Our Core Values.</h2>
              <RainbowDivider />
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))", gap:20 }}>
            {VALUES.map(({ icon, color, title, body }, i) => (
              <FadeIn key={title} delay={i * 0.08}>
                <TiltCard style={{ background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:20, padding:"28px 24px", backdropFilter:"blur(10px)" }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:`${color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>{icon}</div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:19, color, marginBottom:10 }}>{title}</div>
                  <p style={{ fontFamily:"Nunito", fontSize:13.5, color:"rgba(255,255,255,0.72)", lineHeight:1.75, margin:0 }}>{body}</p>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section data-mmn="about-mission" style={{ background:C.yellowBg, padding:"80px 6vw", borderTop:`4px solid ${C.yellow}40` }}>
        <div style={{ maxWidth:740, margin:"0 auto", textAlign:"center" }}>
          <FadeIn>
            <div style={{ fontSize:48, marginBottom:20 }}>🤲</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,38px)", color:C.navy, margin:"0 0 20px" }}>Our Mission</h2>
            <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(16px,2.2vw,21px)", color:C.text, lineHeight:1.85, marginBottom:24 }}>{a.missionQuote}</p>
            <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, lineHeight:1.85 }}>{a.missionSub}</p>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:C.cream, padding:"80px 6vw" }}>
        <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
          <FadeIn>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,38px)", color:C.navy, margin:"0 0 14px" }}>Ready to Learn More?</h2>
            <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, lineHeight:1.75, marginBottom:32 }}>Come see the school. Meet the team. Feel the environment.</p>
            <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              <Link to="/admissions" style={{ background:C.navy, color:C.white, textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:15, padding:"16px 36px", borderRadius:100, boxShadow:"0 6px 24px rgba(27,63,139,0.28)", display:"inline-block" }}>Book a Visit</Link>
              <Link to="/contact" style={{ background:"transparent", color:C.navy, textDecoration:"none", fontFamily:"Nunito", fontWeight:700, fontSize:15, padding:"16px 36px", borderRadius:100, border:`2.5px solid ${C.navy}`, display:"inline-block" }}>Get in Touch</Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default About;
