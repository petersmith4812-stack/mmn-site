import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";
import { useSiteContent } from "../../context/SiteContentContext";

const Philosophy = () => {
  const { content } = useSiteContent();
  const ph = content.homePhilosophy || {};
  const cards = Array.isArray(content.homePhilosophyCards) ? content.homePhilosophyCards : [];

  return (
  <section id="philosophy" data-mmn="home-philosophy" style={{ background: C.navy, padding:"100px 6vw", position:"relative", overflow:"hidden" }}>
    <div style={{
      position:"absolute", inset:0,
      backgroundImage:"radial-gradient(circle at 20% 50%, rgba(75,174,149,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245,197,24,0.08) 0%, transparent 50%)",
      pointerEvents:"none",
    }}/>
    <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
      <FadeIn>
        <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.yellow, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:16 }}>{ph.badge || "Our Belief"}</div>
        <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(28px,4.5vw,52px)", color:C.white, lineHeight:1.15, margin:"0 0 24px" }}>
          {ph.heading1 || "This School Is"}<br/><span style={{color:C.yellow}}>{ph.heading2 || "Not For Every Family."}</span>
        </h2>
        <RainbowDivider />
      </FadeIn>

      <FadeIn delay={0.15}>
        <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(16px,2.2vw,22px)", color:"rgba(255,255,255,0.85)", lineHeight:1.8, marginBottom:32 }}>
          {ph.quote || '"We do not believe that childhood success should be measured by how early a child starts reading."'}
        </p>
      </FadeIn>

      <FadeIn delay={0.25}>
        <p style={{ fontFamily:"Nunito", fontSize:"clamp(14px,1.7vw,17px)", color:"rgba(255,255,255,0.7)", lineHeight:1.9, maxWidth:720, margin:"0 auto 48px" }}>
          {ph.body || "Our focus is not on producing children who perform impressively on command. Our priority is to strengthen their roots."}
        </p>
      </FadeIn>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:20 }}>
        {cards.map(({ icon, title, body }) => (
          <FadeIn key={title} delay={0.1}>
            <TiltCard style={{
              background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.12)",
              borderRadius:20, padding:"28px 24px", textAlign:"left",
              backdropFilter:"blur(10px)",
            }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{icon}</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.yellow, marginBottom:10 }}>{title}</div>
              <p style={{ fontFamily:"Nunito", fontSize:14, color:"rgba(255,255,255,0.72)", lineHeight:1.75, margin:0 }}>{body}</p>
            </TiltCard>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.3}>
        <div style={{
          marginTop:52, padding:"28px 36px",
          background:`linear-gradient(135deg, ${C.coral}22, ${C.yellow}22)`,
          border:`1.5px solid ${C.yellow}44`, borderRadius:20,
        }}>
          <p style={{ fontFamily:"Fredoka One", fontSize:"clamp(18px,2.5vw,26px)", color:C.white, margin:0, lineHeight:1.5 }}>
            We are not preparing children for a rat race.<br/>
            <span style={{color:C.yellow}}>We are nurturing future Khalifahs.</span>
          </p>
          <p style={{ fontFamily:"Nunito", fontStyle:"italic", fontSize:13, color:"rgba(255,255,255,0.55)", marginTop:10, marginBottom:0 }}>
            Representatives of Allah on Earth — a role of profound dignity and responsibility.
          </p>
        </div>
      </FadeIn>
    </div>
  </section>
  );
};

export default Philosophy;
