import { useState } from "react";
import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";

const WeeklyStructure = () => {
  const days = [
    {
      n:"3", label:"Academic Days", color:C.navy, bg:"#EEF2FF", icon:"📚", freq:"week",
      desc:"Rich, intentional learning across all five dimensions — spirit, mind, heart, body, and hands. Languages, Quran, life skills, and meaningful play woven together.",
      detail:"Every concept taught at all 6 levels of Bloom's Taxonomy — from remembering to creating.",
    },
    {
      n:"2", label:"Activity Days", color:C.coral, bg:C.coralBg, icon:"🌿", freq:"week",
      desc:"3 project-based activities per day. Children lead, discuss, choose, and direct.",
      detail:"Rotating through: Science & STEM · DIY Arts · Gardening · Social Studies · Geography · Zoology",
    },
    {
      n:"1", label:"Trip Day", color:C.mint, bg:C.mintBg, icon:"🚌", freq:"month",
      desc:"Every month: a real-world learning trip. Farms, mosques, museums, libraries, nature reserves.",
      detail:"Learning was never meant to live only inside walls.",
    },
  ];

  const bloomLevels = [
    { name:"Remember", desc:"Recall facts and basic concepts" },
    { name:"Understand", desc:"Explain ideas in their own words" },
    { name:"Apply", desc:"Use what they know in new situations" },
    { name:"Analyse", desc:"Draw connections, compare, contrast" },
    { name:"Evaluate", desc:"Justify a stance or decision with reasoning" },
    { name:"Create", desc:"Produce something new — original work, fresh ideas" },
  ];

  const [activeBloom, setActiveBloom] = useState(0);

  return (
    <section id="weekly-structure" style={{ background: C.cream, padding:"100px 6vw" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>The Full Week</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 16px" }}>No Two Days<br/>Are the Same.</h2>
            <RainbowDivider />
          </div>
        </FadeIn>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:24 }}>
          {days.map(({ n, label, color, bg, icon, freq, desc, detail }) => (
            <FadeIn key={label} delay={0.08}>
              <TiltCard maxTilt={5} style={{
                background:bg, borderRadius:24, padding:"32px 28px",
                border:`2px solid ${color}22`,
                boxShadow:"0 4px 16px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize:38, marginBottom:14 }}>{icon}</div>
                <div style={{
                  display:"inline-block",
                  background:color, color:C.white, borderRadius:100,
                  fontFamily:"Nunito", fontWeight:800, fontSize:12,
                  padding:"4px 14px", letterSpacing:"0.06em", marginBottom:16,
                }}>{n} {freq === "month" ? "Day/Month" : "Days/Week"}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:22, color, marginBottom:12 }}>{label}</div>
                <p style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.75, marginBottom:12 }}>{desc}</p>
                <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:13, color:C.muted, lineHeight:1.7, margin:0 }}>{detail}</p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div style={{ marginTop:40, background:C.navy, borderRadius:20, padding:"32px 36px" }}>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.yellow, marginBottom:8 }}>Bloom's Taxonomy — All 6 Levels</div>
              <p style={{ fontFamily:"Nunito", fontSize:14, color:"rgba(255,255,255,0.75)", margin:0, lineHeight:1.7 }}>
                Every concept is taught at all six cognitive levels. Children are never just memorising. They are always thinking. <span style={{ fontStyle:"italic", color:C.yellow }}>Tap each level to learn more.</span>
              </p>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
              {bloomLevels.map(({ name }, i) => (
                <button key={name} onClick={()=>setActiveBloom(i)} style={{
                  background: activeBloom === i ? C.rainbow[i] : "rgba(255,255,255,0.08)",
                  color: activeBloom === i ? C.white : "rgba(255,255,255,0.7)",
                  fontFamily:"Nunito", fontWeight:700, fontSize:12,
                  padding:"8px 16px", borderRadius:100,
                  border: activeBloom === i ? `2px solid ${C.rainbow[i]}` : "2px solid rgba(255,255,255,0.15)",
                  cursor:"pointer", transition:"all 0.25s ease",
                  transform: activeBloom === i ? "scale(1.05)" : "scale(1)",
                }}>{i + 1}. {name}</button>
              ))}
            </div>
            <div style={{
              background:"rgba(255,255,255,0.06)",
              borderLeft:`3px solid ${C.rainbow[activeBloom]}`,
              borderRadius:8, padding:"14px 20px", minHeight:50,
            }}>
              <div style={{ fontFamily:"Fredoka One", fontSize:15, color:C.rainbow[activeBloom], marginBottom:4 }}>
                {bloomLevels[activeBloom].name}
              </div>
              <p style={{ fontFamily:"Nunito", fontSize:14, color:"rgba(255,255,255,0.8)", margin:0, lineHeight:1.65 }}>
                {bloomLevels[activeBloom].desc}
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default WeeklyStructure;
