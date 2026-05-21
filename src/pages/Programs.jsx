import { Link } from "react-router-dom";
import { C } from "../constants/theme";
import { useSiteContent } from "../context/SiteContentContext";
import FadeIn from "../components/ui/FadeIn";
import TiltCard from "../components/ui/TiltCard";
import RainbowDivider from "../components/ui/RainbowDivider";

const Programs = () => {
  const { content } = useSiteContent();
  const p = content.programs || {};
  const PRESCHOOL_PILLARS = Array.isArray(content.programsPillars) ? content.programsPillars : [];
  const PEDAGOGY = Array.isArray(content.programsPedagogy) ? content.programsPedagogy : [];
  const SPECIAL = Array.isArray(content.programsSpecial) ? content.programsSpecial : [];

  return (
  <div style={{ paddingTop: 72 }}>
    {/* ── Hero ── */}
    <section data-mmn="programs-hero" style={{ background:`linear-gradient(160deg,${C.mint} 0%,#2d9478 100%)`, padding:"100px 6vw 90px", position:"relative", overflow:"hidden", minHeight:"50vh", display:"flex", alignItems:"center" }}>
      <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }}/>
      <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:2 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:11, letterSpacing:"0.15em", padding:"6px 16px", borderRadius:100, textTransform:"uppercase", marginBottom:20 }}>
          {p.heroBadge || "What We Offer"}
        </div>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(30px,5vw,60px)", color:C.white, lineHeight:1.1, margin:"0 0 20px", maxWidth:680 }}>
          {p.heroHeading || "Programs Designed for Whole Children."}
        </h1>
        <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,19px)", color:"rgba(255,255,255,0.85)", maxWidth:600, lineHeight:1.8, margin:0 }}>
          {p.heroSub || "Every programme is built around one belief: a child is not a grade."}
        </p>
      </div>
    </section>

    {/* ── Preschool ── */}
    <section data-mmn="programs-preschool" style={{ background:C.cream, padding:"100px 6vw" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>{p.preschoolBadge || "Ages 4 – 7"}</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,48px)", color:C.navy, margin:"0 0 14px" }}>{p.preschoolHeading || "The Preschool Programme"}</h2>
            <RainbowDivider />
            <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, maxWidth:580, margin:"0 auto", lineHeight:1.8 }}>
              {p.preschoolSub || "We do not teach subjects. Every experience nourishes one of five dimensions of who your child is — as Allah created them."}
            </p>
          </div>
        </FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20 }}>
          {PRESCHOOL_PILLARS.map(({ icon, color, title, body }, i) => (
            <FadeIn key={title} delay={i * 0.07}>
              <TiltCard maxTilt={5} style={{ background:C.white, borderRadius:22, padding:"28px 24px", border:`2px solid ${color}20`, boxShadow:"0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ width:50, height:50, borderRadius:14, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}>{icon}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:19, color, marginBottom:10 }}>{title}</div>
                <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

    {/* ── Pedagogy ── */}
    <section data-mmn="programs-pedagogy" style={{ background:C.warmGray, padding:"100px 6vw" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>{p.pedagogyBadge || "How We Teach"}</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 14px" }}>{p.pedagogyHeading || "Three Approaches. One Foundation."}</h2>
            <RainbowDivider />
            <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, maxWidth:540, margin:"0 auto", lineHeight:1.8 }}>{p.pedagogySub || "Each pedagogy contributes something specific. None of them are the foundation. Islam is the foundation."}</p>
          </div>
        </FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
          {PEDAGOGY.map(({ color, icon, title, sub, points }, i) => {
            const pts = Array.isArray(points) ? points : (typeof points === "string" ? points.split("\n").filter(Boolean) : []);
            return (
            <FadeIn key={title} delay={i * 0.1}>
              <TiltCard maxTilt={5} style={{ background:`${color}10`, borderRadius:24, padding:"32px 28px", border:`2px solid ${color}22` }}>
                <div style={{ fontSize:40, marginBottom:16 }}>{icon}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:22, color, marginBottom:4 }}>{title}</div>
                <div style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:13, color:C.muted, marginBottom:18 }}>{sub}</div>
                {pts.map(pt => (
                  <div key={pt} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:color, marginTop:7, flexShrink:0 }}/>
                    <span style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.65 }}>{pt}</span>
                  </div>
                ))}
              </TiltCard>
            </FadeIn>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── Afterschool Club ── */}
    <section data-mmn="programs-afterschool" style={{ background:`linear-gradient(135deg,${C.yellow}18,${C.coral}12)`, padding:"100px 6vw", borderTop:`4px solid ${C.yellow}40` }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>Beyond School Hours</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 14px" }}>The Socialisation Club</h2>
            <RainbowDivider />
            <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, maxWidth:560, margin:"0 auto", lineHeight:1.8 }}>
              Where homeschooling and school-going children come together for intentional, activity-based meetups — because good socialisation does not happen by accident.
            </p>
          </div>
        </FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
          {[
            { icon:"🏠", color:C.mint,  title:"Homeschooling Families", body:"Structured social experiences, group activities, and a community of like-minded parents all growing in the same direction." },
            { icon:"🌈", color:C.coral, title:"All Are Welcome",         body:"School-going children join too. It is about building the right kind of friendships — rooted in shared values." },
            { icon:"💛", color:C.yellow,title:"Younger Kids + Mama",     body:"Mothers accompanying younger children join for free. The first socialisation a child needs is seeing their mother in community." },
            { icon:"🎯", color:C.navy,  title:"Activity-Based",          body:"Every meetup is intentionally designed — structured activities, learning outcomes, and Tarbiyah woven through every session." },
          ].map(({ icon, title, color, body }) => (
            <FadeIn key={title} delay={0.08}>
              <TiltCard maxTilt={5} style={{ background:C.white, borderRadius:20, padding:"24px 20px", border:`2px solid ${color}28`, boxShadow:"0 4px 16px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{icon}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:17, color, marginBottom:8 }}>{title}</div>
                <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

    {/* ── Special Programmes ── */}
    <section data-mmn="programs-special" style={{ background:C.navy, padding:"100px 6vw" }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.yellow, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>{p.specialBadge || "Included in Enrolment"}</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.white, margin:"0 0 14px" }}>{p.specialHeading || "More Than You Expect."}</h2>
            <RainbowDivider />
          </div>
        </FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:22 }}>
          {SPECIAL.map(({ icon, color, freq, title, quote, body }) => (
            <FadeIn key={title} delay={0.1}>
              <TiltCard maxTilt={4} style={{ background:C.white, borderRadius:24, overflow:"hidden", border:`1.5px solid ${color}22`, boxShadow:"0 4px 20px rgba(0,0,0,0.05)" }}>
                <div style={{ background:color, padding:"18px 24px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:34 }}>{icon}</span>
                    <span style={{ background:"rgba(255,255,255,0.25)", color:C.white, fontFamily:"Nunito", fontWeight:800, fontSize:11, padding:"4px 12px", borderRadius:100 }}>{freq}</span>
                  </div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:21, color:C.white, marginTop:10 }}>{title}</div>
                </div>
                <div style={{ padding:"20px 24px" }}>
                  <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:13, color, lineHeight:1.65, margin:"0 0 14px", borderLeft:`3px solid ${color}40`, paddingLeft:12 }}>{quote}</p>
                  <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
                </div>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section style={{ background:C.cream, padding:"80px 6vw" }}>
      <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
        <FadeIn>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,38px)", color:C.navy, margin:"0 0 14px" }}>Interested in Joining?</h2>
          <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, lineHeight:1.75, marginBottom:32 }}>Book a visit and experience the environment for yourself.</p>
          <Link to="/admissions" style={{ background:C.navy, color:C.white, textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:15, padding:"16px 40px", borderRadius:100, boxShadow:"0 6px 24px rgba(27,63,139,0.28)", display:"inline-block" }}>Start Enrolment</Link>
        </FadeIn>
      </div>
    </section>
  </div>
  );
};

export default Programs;
