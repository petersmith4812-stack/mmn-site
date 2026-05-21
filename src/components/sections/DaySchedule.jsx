import { useState } from "react";
import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";

const DaySchedule = () => {
  const [activePillar, setActivePillar] = useState(null);
  const pillars = [
    { icon:"🌙", color:C.navy, bg:"#EEF2FF", title:"Ruh — Spirit",
      body:"Every day begins and ends with Allah. Quran is heard, felt, and loved before it is memorised. Duas are learned in the moments they belong to — not in isolation. Aqeedah is not a subject. It is the lens through which children see the whole day." },
    { icon:"🧠", color:C.coral, bg:C.coralBg, title:"Aql — Mind",
      body:"Languages, mathematics, and inquiry live here. Three languages — English, Urdu, and Arabic — are woven through every activity. Maths begins with hands, never with pencils. Science is the daily question: what did Allah make, and how does it work?" },
    { icon:"💚", color:C.mint, bg:C.mintBg, title:"Qalb — Heart",
      body:"Feelings are not managed here — they are understood. Children build vocabulary for their inner world in three languages. They learn to repair relationships, not just apologise. Empathy is practised, not taught." },
    { icon:"🌿", color:"#7BAF3E", bg:"#F2F8EA", title:"Jism — Body",
      body:"Children spend meaningful time outdoors every week. They cook, move, ride, dig, and carry. The body is an Amanah from Allah — we treat it that way. Physical confidence and health are not extracurricular. They are the curriculum." },
    { icon:"🤲", color:"#8B6BE8", bg:"#F3F0FF", title:"Yadayn — Hands",
      body:"Children make things. They cook their own snack, care for their space, create through clay and paint, and work with materials that respond to their effort. Every practical task is also a lesson in patience, precision, and gratitude." },
  ];
  return (
    <section id="a-day-here" style={{ background: C.warmGray, padding:"100px 6vw" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.mint, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>What Your Child Experiences</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 16px" }}>Five Dimensions.<br/>One Whole Child.</h2>
            <RainbowDivider />
            <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, maxWidth:580, margin:"0 auto", lineHeight:1.75 }}>
              We do not teach subjects. Every experience your child has here nourishes one of five dimensions of who they are as a human being — as Allah created them.
              <br/><span style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:13, color:C.coral }}>Hover or tap each card to explore.</span>
            </p>
          </div>
        </FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))", gap:20 }}>
          {pillars.map(({ icon, color, bg, title, body }, i) => (
            <FadeIn key={title} delay={i * 0.07}>
              <TiltCard
                maxTilt={6}
                onMouseEnter={()=>setActivePillar(i)}
                onMouseLeave={()=>setActivePillar(null)}
                onClick={()=>setActivePillar(activePillar === i ? null : i)}
                style={{
                  background: bg, borderRadius:22, padding:"30px 26px",
                  border:`2px solid ${color}${activePillar === i ? "60" : "20"}`,
                  cursor:"pointer", position:"relative", overflow:"hidden",
                  boxShadow: activePillar === i ? `0 18px 40px ${color}25` : "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{
                  position:"absolute", top:-30, right:-30,
                  width:120, height:120, borderRadius:"50%",
                  background: color, opacity: activePillar === i ? 0.08 : 0,
                  transition:"opacity 0.4s ease",
                }}/>
                <div style={{ fontSize:36, marginBottom:14, position:"relative", transform: activePillar === i ? "scale(1.1)" : "scale(1)", transition:"transform 0.3s ease" }}>{icon}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:21, color, marginBottom:12, position:"relative" }}>{title}</div>
                <p style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.8, margin:0, position:"relative" }}>{body}</p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DaySchedule;
