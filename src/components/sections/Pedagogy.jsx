import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";

const Pedagogy = () => (
  <section id="pedagogy" data-mmn="home-pedagogy" style={{ background: C.cream, padding:"100px 6vw" }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <FadeIn>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>How We Teach</div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 16px" }}>Three Approaches.<br/>One Foundation.</h2>
          <RainbowDivider />
          <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, maxWidth:560, margin:"0 auto", lineHeight:1.75 }}>Each pedagogy contributes something specific. None of them are the foundation. Islam is the foundation.</p>
        </div>
      </FadeIn>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
        {[
          {
            color: C.coral, bg: C.coralBg, icon:"🎨",
            title:"Reggio Emilia", sub:"100 Languages of the Child",
            points:["Child-led, self-paced — every child on their own natural rhythm","Environment as the third teacher","Documentation honours each child's individual journey","Curiosity is never interrupted by a syllabus that doesn't wait"],
          },
          {
            color: C.navy, bg:"#EEF2FF", icon:"📖",
            title:"Waldorf", sub:"Storytelling + Seerah",
            points:["Stories before screens, imagination before instruction","Prophets' stories replace fairy tale archetypes","Seasonal rhythms follow the Islamic Hijri calendar","Handwork builds concentration and care"],
          },
          {
            color: C.mint, bg: C.mintBg, icon:"🧩",
            title:"Montessori", sub:"Prepared Environment",
            points:["Concrete before abstract — hands before pencils","Freedom within limits grounded in Islamic adab","Practical life as ibadah (wudu, folding, serving)","Children choose their work within a prepared environment"],
          },
        ].map(({ color, bg, icon, title, sub, points }) => (
          <FadeIn key={title} delay={0.1}>
            <TiltCard maxTilt={5} style={{ background: bg, borderRadius:24, padding:"32px 28px", border:`2px solid ${color}22` }}>
              <div style={{ fontSize:40, marginBottom:16 }}>{icon}</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:22, color, marginBottom:4 }}>{title}</div>
              <div style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:13, color:C.muted, marginBottom:20 }}>{sub}</div>
              {points.map(p => (
                <div key={p} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:color, marginTop:6, flexShrink:0 }}/>
                  <span style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.6 }}>{p}</span>
                </div>
              ))}
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default Pedagogy;
