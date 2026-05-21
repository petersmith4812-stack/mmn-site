import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";

const ForMothers = () => (
  <section id="for-mothers" style={{ background:C.navy, padding:"100px 6vw", position:"relative", overflow:"hidden" }}>
    <div style={{
      position:"absolute", inset:0,
      background:"radial-gradient(ellipse at 0% 100%, rgba(75,174,149,0.15) 0%, transparent 50%)",
      pointerEvents:"none",
    }}/>
    <div style={{ maxWidth:1100, margin:"0 auto", position:"relative" }}>
      <FadeIn>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:`linear-gradient(135deg, ${C.coral}, ${C.yellow})`,
            color:C.white, fontFamily:"Nunito", fontWeight:800,
            fontSize:11, letterSpacing:"0.14em", padding:"7px 16px",
            borderRadius:100, textTransform:"uppercase", marginBottom:18,
          }}>
            ✦ The First Of Its Kind ✦
          </div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.white, margin:"0 0 16px", lineHeight:1.15 }}>
            The First School Ever<br/>
            <span style={{color:C.yellow}}>Where Mothers Stay With Their Children.</span>
          </h2>
          <RainbowDivider />
          <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,255,255,0.82)", maxWidth:680, margin:"0 auto 16px", lineHeight:1.8 }}>
            In every other preschool, the mother's role ends at the gate.
            <br/>At Mini Muslims Nest, <b style={{ color:C.yellow, fontStyle:"normal", fontWeight:700 }}>the gate is the beginning</b>.
          </p>
          <p style={{ fontFamily:"Nunito", fontSize:14.5, color:"rgba(255,255,255,0.65)", maxWidth:620, margin:"0 auto", lineHeight:1.8 }}>
            You walk in with your child. You sit in the same building. You learn while they learn. You leave with them — different from the woman who walked in. This is not a service. It is a journey we take together.
          </p>
        </div>
      </FadeIn>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
        {[
          { icon:"📖", color:C.yellow, title:"Friday Halaqa",
            body:"Every Friday, mothers gather for Tafseer and Tadabbur — not a lecture, but a living circle of reflection. We open the Quran together, sit with its meaning, and carry it home. Children may observe quietly, and mothers are encouraged to revisit the Ayah with their children later that day." },
          { icon:"💆", color:C.coral, title:"Parent Coaching Sessions",
            body:"Sessions with trained coaches covering anger management, conscious parenting, time management, and emotional regulation. A mother who is growing creates a home where growth is natural." },
          { icon:"🤝", color:C.mint, title:"The Mother Circle",
            body:"A daily gathering for mothers running alongside the children's morning programme. Discussion, practical workshops, and a community of women growing in the same direction at the same time." },
          { icon:"🌱", color:"#8B6BE8", title:"HT4 Framework",
            body:"Our mother curriculum is built on four pillars: Teaching, Tarbiyah, Transformation, Tadabbur. You do not just bring your child here. You grow here too." },
        ].map(({ icon, color, title, body }) => (
          <FadeIn key={title} delay={0.08}>
            <TiltCard
              maxTilt={5}
              style={{
                background:"rgba(255,255,255,0.06)", border:`1.5px solid rgba(255,255,255,0.1)`,
                borderRadius:20, padding:"28px 24px", backdropFilter:"blur(10px)",
                transition:"transform 0.25s, background 0.25s, border 0.25s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.border=`1.5px solid ${color}50`;}}
              onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.border="1.5px solid rgba(255,255,255,0.1)";}}
            >
              <div style={{
                width:48, height:48, borderRadius:14, background:`${color}25`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22, marginBottom:16,
              }}>{icon}</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:19, color, marginBottom:10 }}>{title}</div>
              <p style={{ fontFamily:"Nunito", fontSize:14, color:"rgba(255,255,255,0.70)", lineHeight:1.75, margin:0 }}>{body}</p>
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default ForMothers;
