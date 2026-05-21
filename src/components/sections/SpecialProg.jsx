import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";

const SpecialProg = () => (
  <section id="special-programmes" style={{ background:C.warmGray, padding:"100px 6vw" }}>
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      <FadeIn>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.mint, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>Included in Enrolment</div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 16px" }}>More Than You Expect.</h2>
          <RainbowDivider />
        </div>
      </FadeIn>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:22 }}>
        {[
          { icon:"🐴", color:C.coral, freq:"Monthly", title:"Horse Riding",
            hadith:'"Teach your children swimming, archery, and horse riding." — The Prophet ﷺ',
            body:"Once a month, children visit our partner equestrian facility. They groom, care for, and ride horses under expert supervision. Core strength, emotional regulation, empathy, and courage — built in one extraordinary experience." },
          { icon:"🧠", color:C.navy, freq:"Monthly", title:"Child Psychologist",
            hadith:"Behavioural development is monitored — not just observed.",
            body:"A child psychologist visits monthly to conduct play-based developmental checks. Concerns are caught early. Reports go to parents. The school does not wait for problems to become crises." },
          { icon:"🥗", color:C.mint, freq:"Per Term", title:"Nutritionist Checkup",
            hadith:"The brain of a hungry or sugar-flooded child cannot absorb Quran.",
            body:"A paediatric nutritionist sees every child at enrolment and each term. Personalised plans provided to families in Urdu and English. Our snack policy is nutritionist-written and non-negotiable." },
        ].map(({ icon, color, freq, title, hadith, body }) => (
          <FadeIn key={title} delay={0.1}>
            <TiltCard maxTilt={5} style={{
              background:C.white, borderRadius:24, overflow:"hidden",
              border:`1.5px solid ${color}22`,
              boxShadow:"0 4px 20px rgba(0,0,0,0.05)",
            }}>
              <div style={{ background:color, padding:"20px 24px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:36 }}>{icon}</span>
                  <span style={{ background:"rgba(255,255,255,0.25)", color:C.white, fontFamily:"Nunito", fontWeight:800, fontSize:11, padding:"4px 12px", borderRadius:100, letterSpacing:"0.06em" }}>{freq}</span>
                </div>
                <div style={{ fontFamily:"Fredoka One", fontSize:22, color:C.white, marginTop:10 }}>{title}</div>
              </div>
              <div style={{ padding:"20px 24px" }}>
                <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:13, color:color, lineHeight:1.65, margin:"0 0 14px", borderLeft:`3px solid ${color}40`, paddingLeft:12 }}>{hadith}</p>
                <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
              </div>
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default SpecialProg;
