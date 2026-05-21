import { Link } from "react-router-dom";
import { C } from "../constants/theme";
import { useSiteContent } from "../context/SiteContentContext";
import FadeIn from "../components/ui/FadeIn";
import TiltCard from "../components/ui/TiltCard";
import RainbowDivider from "../components/ui/RainbowDivider";

const ForMothersPage = () => {
  const { content } = useSiteContent();
  const m = content.forMothers || {};
  const PROGRAMMES = Array.isArray(content.mothersProgrammes) ? content.mothersProgrammes : [];

  return (
  <div style={{ paddingTop: 72 }}>
    {/* ── Hero ── */}
    <section data-mmn="mothers-hero" style={{ background:`linear-gradient(160deg,${C.coral} 0%,#d4623d 100%)`, padding:"100px 6vw 90px", position:"relative", overflow:"hidden", minHeight:"52vh", display:"flex", alignItems:"center" }}>
      <div style={{ position:"absolute", top:-80, right:-80, width:450, height:450, borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-60, left:-60, width:350, height:350, borderRadius:"50%", background:"rgba(255,255,255,0.05)", pointerEvents:"none" }}/>
      <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:2 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.18)", color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:11, letterSpacing:"0.15em", padding:"6px 16px", borderRadius:100, textTransform:"uppercase", marginBottom:20 }}>{m.heroBadge || "✦ The First Of Its Kind ✦"}</div>
        <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(30px,5vw,62px)", color:C.white, lineHeight:1.08, margin:"0 0 22px", maxWidth:700 }}>
          {m.heroHeading1 || "You Don't"}<br/>{m.heroHeading2 || "Drop Off and"}<span style={{ color:C.yellow }}> {m.heroHeading3 || "Leave."}</span>
        </h1>
        <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,20px)", color:"rgba(255,255,255,0.88)", maxWidth:600, lineHeight:1.82, margin:0 }}>
          {m.heroSub || "At Mini Muslims Nest, the mother's journey begins the moment she walks through the door — alongside her child, not behind it."}
        </p>
      </div>
    </section>

    {/* ── The Why ── */}
    <section data-mmn="mothers-why" style={{ background:C.cream, padding:"100px 6vw" }}>
      <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
        <FadeIn>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 20px" }}>
            {m.whyHeading1 || "In Every Other School,"}<br/><span style={{ color:C.coral }}>{m.whyHeading2 || "The Gate Is the End."}</span>
          </h2>
          <RainbowDivider />
          <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(16px,2.2vw,21px)", color:C.text, lineHeight:1.85, marginBottom:28, maxWidth:720, margin:"0 auto 28px" }}>
            {m.whyBody1 || "The mother drops off. The gate closes. She drives away — leaving behind the most sacred years of her child's life, handed to strangers."}
          </p>
          <p style={{ fontFamily:"Nunito", fontSize:16, color:C.muted, lineHeight:1.85, maxWidth:680, margin:"0 auto 28px" }}>
            {m.whyBody2 || "We refused to accept that."}
          </p>
          <div style={{ background:C.navy, borderRadius:20, padding:"28px 36px", maxWidth:680, margin:"0 auto" }}>
            <p style={{ fontFamily:"Fredoka One", fontSize:"clamp(18px,2.5vw,26px)", color:C.white, margin:0, lineHeight:1.5 }}>
              {m.whyCallout || "At Mini Muslims Nest, the gate is the beginning."}
            </p>
          </div>
        </FadeIn>
      </div>
    </section>

    {/* ── A Day in the Life ── */}
    <section data-mmn="mothers-day" style={{ background:C.warmGray, padding:"100px 6vw" }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:60 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>{m.dayBadge || "A Day in the Life"}</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,44px)", color:C.navy, margin:"0 0 14px" }}>{m.dayHeading || "What a Day Actually Looks Like"}</h2>
            <RainbowDivider />
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.white, borderRadius:100, padding:"8px 22px", marginTop:22, boxShadow:"0 2px 10px rgba(0,0,0,0.07)" }}>
              <span style={{ fontSize:15 }}>🕙</span>
              <span style={{ fontFamily:"Nunito", fontWeight:800, fontSize:14, color:C.navy }}>10:00 am – 2:00 pm</span>
            </div>
            <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, lineHeight:1.8, maxWidth:580, margin:"20px auto 0" }}>
              Short blocks. Frequent breaks. Play woven through everything. Mothers present — learning and growing right alongside their children.
            </p>
          </div>
        </FadeIn>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:18 }}>
          {[
            { icon:"🌸", title:"Circle Time",            desc:"Every day begins together. Morning du'a, Quran recitation, sharing thoughts, and setting intentions — mothers and children as one circle.",                                                                    color:C.coral,   tag:"Together" },
            { icon:"🥗", title:"Cooking Together",        desc:"Children and mothers prepare a wholesome snack side by side — fine motor skills, teamwork, and love of healthy food all woven into one beautiful moment.",                                                    color:"#e8a020", tag:"Together" },
            { icon:"📚", title:"Play-Based Learning",     desc:"Short, focused academic blocks — literacy, numeracy, and creative exploration — always through play. Never long enough to bore, always followed by a break to move and reset.",                             color:C.navy,    tag:"Children" },
            { icon:"📖", title:"Quran & Islamic Studies", desc:"Gentle recitation, Islamic stories, and character-building rooted in the Sunnah. Love of the Deen woven quietly and intentionally into every part of the day.",                                            color:"#7c5cbf", tag:"Children" },
            { icon:"🌿", title:"Outdoor & Creative Play", desc:"Building, imagining, creating — long stretches of free and project-based play, outdoors whenever possible. This is not a break from learning. It is the learning.",                                         color:C.mint,    tag:"Children" },
            { icon:"🤲", title:"Shared Meals & Closing",  desc:"Lunch begins with Bismillah and ends with dhikr. The day closes as it opened — together, in gratitude, with a du'a before every child leaves hand in hand with their mother.",                              color:C.coral,   tag:"Together" },
          ].map(({ icon, title, desc, color, tag }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div style={{ background:C.white, borderRadius:20, padding:"24px 22px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", borderTop:`4px solid ${color}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:13, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
                  <span style={{ background:`${color}18`, color, fontFamily:"Nunito", fontWeight:700, fontSize:10, padding:"3px 10px", borderRadius:100, border:`1px solid ${color}30` }}>{tag}</span>
                </div>
                <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.navy, marginBottom:8 }}>{title}</div>
                <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.muted, lineHeight:1.72, margin:0 }}>{desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20, marginTop:28 }}>
          <FadeIn delay={0.5}>
            <div style={{ background:`linear-gradient(135deg,${C.navy} 0%,#0f2a5e 100%)`, borderRadius:20, padding:"28px 24px" }}>
              <div style={{ fontSize:28, marginBottom:12 }}>🕌</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.yellow, marginBottom:6 }}>Friday Ḥalqa</div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:"rgba(255,255,255,0.45)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Every Friday · Mothers Only</div>
              <p style={{ fontFamily:"Nunito", fontSize:13.5, color:"rgba(255,255,255,0.75)", lineHeight:1.75, margin:0 }}>
                A dedicated weekly circle for Tafseer and Tadabbur of the Quran. Deep reflection, guided discussion, and a space to reconnect with the words of Allah — together.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div style={{ background:`linear-gradient(135deg,${C.coral} 0%,#d4623d 100%)`, borderRadius:20, padding:"28px 24px" }}>
              <div style={{ fontSize:28, marginBottom:12 }}>🌱</div>
              <div style={{ fontFamily:"Fredoka One", fontSize:20, color:C.white, marginBottom:6 }}>Mothers' Training</div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:10, color:"rgba(255,255,255,0.55)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:12 }}>Regular Sessions · Growth-Focused</div>
              <p style={{ fontFamily:"Nunito", fontSize:13.5, color:"rgba(255,255,255,0.85)", lineHeight:1.75, margin:0 }}>
                Structured sessions empowering mothers as their child's first and most important teacher — covering Islamic parenting, character development, and personal growth.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>

    {/* ── Mother Programmes ── */}
    <section data-mmn="mothers-programmes" style={{ background:C.navy, padding:"100px 6vw" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.yellow, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>{m.programsBadge || "What Awaits You"}</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.white, margin:"0 0 14px" }}>{m.programsHeading || "The Mother's Programme."}</h2>
            <RainbowDivider />
            <p style={{ fontFamily:"Nunito", fontSize:15, color:"rgba(255,255,255,0.7)", maxWidth:540, margin:"0 auto", lineHeight:1.8 }}>
              {m.programsSub || "You don't just bring your child here. You come here to grow, connect, and be transformed."}
            </p>
          </div>
        </FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:22 }}>
          {PROGRAMMES.map(({ icon, color, title, body, tag }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <TiltCard maxTilt={5} style={{ background:"rgba(255,255,255,0.07)", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:22, padding:"28px 24px", backdropFilter:"blur(10px)" }}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.11)";e.currentTarget.style.border=`1.5px solid ${color}50`;}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.07)";e.currentTarget.style.border="1.5px solid rgba(255,255,255,0.12)";}}
              >
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${color}28`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{icon}</div>
                  <span style={{ background:`${color}22`, color, fontFamily:"Nunito", fontWeight:700, fontSize:11, padding:"4px 12px", borderRadius:100, border:`1px solid ${color}40` }}>{tag}</span>
                </div>
                <div style={{ fontFamily:"Fredoka One", fontSize:19, color, marginBottom:10 }}>{title}</div>
                <p style={{ fontFamily:"Nunito", fontSize:13.5, color:"rgba(255,255,255,0.72)", lineHeight:1.75, margin:0 }}>{body}</p>
              </TiltCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

    {/* ── HT4 ── */}
    <section style={{ background:C.yellowBg, padding:"80px 6vw", borderTop:`4px solid ${C.yellow}40` }}>
      <div style={{ maxWidth:780, margin:"0 auto", textAlign:"center" }}>
        <FadeIn>
          <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:16 }}>The Framework</div>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,42px)", color:C.navy, margin:"0 0 24px" }}>The HT4 Framework</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:16, marginBottom:32 }}>
            {[["Teaching","🏫"],["Tarbiyah","🌱"],["Transformation","✨"],["Tadabbur","📖"]].map(([word,icon]) => (
              <div key={word} style={{ background:C.white, borderRadius:16, padding:"20px 14px", border:`2px solid ${C.yellow}40` }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:16, color:C.navy }}>{word}</div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:"Nunito", fontSize:15, color:C.muted, lineHeight:1.85 }}>
            Our mother curriculum goes beyond parenting tips. It is a structured journey of spiritual growth, personal transformation, and deepening connection to the Quran — running alongside your child's growth, in parallel.
          </p>
        </FadeIn>
      </div>
    </section>

    {/* ── CTA ── */}
    <section style={{ background:C.cream, padding:"80px 6vw" }}>
      <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
        <FadeIn>
          <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,38px)", color:C.navy, margin:"0 0 14px" }}>This Is Your Invitation.</h2>
          <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:17, color:C.muted, lineHeight:1.8, marginBottom:32 }}>
            To grow. To learn. To be present. To be transformed — alongside your child.
          </p>
          <Link to="/admissions" style={{ background:C.coral, color:C.white, textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:15, padding:"16px 40px", borderRadius:100, boxShadow:`0 6px 24px ${C.coral}50`, display:"inline-block" }}>Book a Family Visit</Link>
        </FadeIn>
      </div>
    </section>
  </div>
  );
};

export default ForMothersPage;
