import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import TiltCard from "../ui/TiltCard";
import RainbowDivider from "../ui/RainbowDivider";

const AfterschoolClub = () => (
  <section id="afterschool-club" style={{
    background:`linear-gradient(135deg, ${C.yellow}18, ${C.coral}12)`,
    padding:"100px 6vw", borderTop:`4px solid ${C.yellow}40`
  }}>
    <div style={{ maxWidth:1000, margin:"0 auto" }}>
      <FadeIn>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>Beyond School Hours</div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 16px" }}>The Socialisation Club</h2>
          <RainbowDivider />
          <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, maxWidth:560, margin:"0 auto", lineHeight:1.75 }}>
            Where homeschooling and school-going children come together for activity-based meetups — because socialisation should be intentional, not accidental.
          </p>
        </div>
      </FadeIn>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
        {[
          { icon:"🏠", title:"Homeschooling Families", color:C.mint,
            body:"We proudly support homeschooling families with structured social experiences, group activities, and a community of like-minded parents growing in the same direction." },
          { icon:"🌈", title:"All Are Welcome", color:C.coral,
            body:"School-going children join too. It is not about where they learn. It is about building the right kind of friendships — rooted in shared values." },
          { icon:"💛", title:"Younger Kids + Mama", color:C.yellow,
            body:"Mothers accompanying younger children join for free. Because the first socialisation a child needs is seeing their mother in community." },
          { icon:"🎯", title:"Activity-Based Meetups", color:C.navy,
            body:"Every meetup is intentionally designed. Not just a playdate — structured activities, learning outcomes, and Tarbiyah woven through every session." },
        ].map(({ icon, title, color, body }) => (
          <FadeIn key={title} delay={0.1}>
            <TiltCard maxTilt={5} style={{
              background:C.white, borderRadius:20, padding:"24px 22px",
              border:`2px solid ${color}30`, boxShadow:"0 4px 16px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize:32, marginBottom:12 }}>{icon}</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:18, color, marginBottom:10 }}>{title}</div>
              <p style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
            </TiltCard>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default AfterschoolClub;
