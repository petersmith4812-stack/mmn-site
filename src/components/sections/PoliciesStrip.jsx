import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";

const PoliciesStrip = () => (
  <section style={{ background: C.yellowBg, borderTop:`3px solid ${C.yellow}50`, borderBottom:`3px solid ${C.yellow}50`, padding:"56px 6vw" }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <FadeIn>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:10 }}>A Few Things Worth Knowing</div>
          <h3 style={{ fontFamily:"Fredoka One", fontSize:"clamp(22px,3vw,34px)", color:C.navy, margin:0 }}>The Choices We Made Intentionally.</h3>
        </div>
      </FadeIn>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:20 }}>
        {[
          { icon:"🕙", color:C.navy, title:"Starts at 10 AM",
            body:"No morning rush. No stressed arrivals. Children walk in calm, fed, and ready. We believe the morning belongs to the family first." },
          { icon:"👶", color:C.coral, title:"Ages 4 to 7",
            body:"We enrol children from age 4 up to 7. We do not accept children younger than 4 — emotional readiness cannot be forced or scheduled. If your child is not ready, neither are we." },
          { icon:"👕", color:C.mint, title:"No Uniforms",
            body:"Children wear from 4 fixed, simple sets of clothing — rotated each week. The focus stays on character, not appearance. What your child wears will never be a topic of conversation here." },
          { icon:"🌱", color:"#8B6BE8", title:"Your Child's Pace. Not Ours.",
            body:"Some children are ready to move forward in 6 months. Others need 18. Both are completely right. We do not push children on our schedule — we follow theirs. The goal is genuine understanding and a love of learning, not performance on command." },
        ].map(({ icon, color, title, body }) => (
          <FadeIn key={title} delay={0.08}>
            <TiltCard maxTilt={4} style={{
              background:C.white, borderRadius:18, padding:"24px 22px",
              border:`2px solid ${color}20`,
              boxShadow:"0 3px 14px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize:30, marginBottom:10 }}>{icon}</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:17, color, marginBottom:8 }}>{title}</div>
              <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default PoliciesStrip;
