import { useState } from "react";
import { Link } from "react-router-dom";
import { C } from "../constants/theme";
import { useSiteContent } from "../context/SiteContentContext";
import FadeIn from "../components/ui/FadeIn";
import TiltCard from "../components/ui/TiltCard";
import RainbowDivider from "../components/ui/RainbowDivider";

const Admissions = () => {
  const { content } = useSiteContent();
  const a = content.admissions || {};
  const PROCESS = Array.isArray(content.admissionsProcess) ? content.admissionsProcess : [];
  const REQUIREMENTS = Array.isArray(content.admissionsReqs) ? content.admissionsReqs : [];
  const FAQS = Array.isArray(content.admissionsFaqs) ? content.admissionsFaqs : [];
  const NOT_FOR = Array.isArray(content.admissionsNotFor) ? content.admissionsNotFor : [];
  const PERFECT_FOR = Array.isArray(content.admissionsPerfectFor) ? content.admissionsPerfectFor : [];
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ paddingTop: 72 }}>
      {/* ── Hero ── */}
      <section data-mmn="admissions-hero" style={{ background:`linear-gradient(160deg,#8B6BE8 0%,#5c3fb5 100%)`, padding:"100px 6vw 90px", position:"relative", overflow:"hidden", minHeight:"50vh", display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:450, height:450, borderRadius:"50%", background:"rgba(255,255,255,0.06)", pointerEvents:"none" }}/>
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.15)", color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:11, letterSpacing:"0.15em", padding:"6px 16px", borderRadius:100, textTransform:"uppercase", marginBottom:20 }}>Join the Nest</div>
          <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(28px,5vw,58px)", color:C.white, lineHeight:1.1, margin:"0 0 20px", maxWidth:720 }}>
            Is This the Right<br/>School for <span style={{ color:C.yellow }}>Your Family?</span>
          </h1>
          <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,19px)", color:"rgba(255,255,255,0.85)", maxWidth:600, lineHeight:1.82, margin:0 }}>
            We do not accept every family — and we are honest about that. We accept families who are ready to walk a different road.
          </p>
        </div>
      </section>

      {/* ── Who We're For ── */}
      <section data-mmn="admissions-who" style={{ background:C.navy, padding:"100px 6vw" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.yellow, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>Be Honest With Yourself</div>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.white, margin:"0 0 14px" }}>Is This School For You?</h2>
              <RainbowDivider />
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:22 }}>
            {[
              { icon:"❌", color:C.coral, bg:"rgba(240,135,106,0.1)", title: a.notForHeading || "Not For You If…", points: NOT_FOR },
              { icon:"✅", color:C.mint,  bg:"rgba(75,174,149,0.1)",  title: a.perfectForHeading || "Perfectly For You If…", points: PERFECT_FOR },
            ].map(({ icon, color, bg, title, points }) => (
              <FadeIn key={title} delay={0.1}>
                <div style={{ background:bg, border:`2px solid ${color}30`, borderRadius:22, padding:"32px 28px" }}>
                  <div style={{ fontSize:36, marginBottom:14 }}>{icon}</div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:20, color, marginBottom:18 }}>{title}</div>
                  {points.map(pt => (
                    <div key={pt} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:12 }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:color, marginTop:7, flexShrink:0 }}/>
                      <span style={{ fontFamily:"Nunito", fontSize:14, color:"rgba(255,255,255,0.8)", lineHeight:1.65 }}>{pt}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Process ── */}
      <section data-mmn="admissions-process" style={{ background:C.warmGray, padding:"100px 6vw" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:60 }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>Step by Step</div>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(26px,4vw,46px)", color:C.navy, margin:"0 0 14px" }}>The Enrolment Process.</h2>
              <RainbowDivider />
            </div>
          </FadeIn>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:22 }}>
            {PROCESS.map(({ step, icon, color, title, body }, i) => (
              <FadeIn key={step} delay={i * 0.1}>
                <TiltCard maxTilt={4} style={{ background:C.white, borderRadius:22, padding:"28px 22px", boxShadow:"0 4px 16px rgba(0,0,0,0.05)", border:`2px solid ${color}20` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div style={{ fontFamily:"Fredoka One", fontSize:13, color, background:`${color}15`, padding:"4px 12px", borderRadius:100 }}>{step}</div>
                    <span style={{ fontSize:28 }}>{icon}</span>
                  </div>
                  <div style={{ fontFamily:"Fredoka One", fontSize:18, color, marginBottom:10 }}>{title}</div>
                  <p style={{ fontFamily:"Nunito", fontSize:13.5, color:C.text, lineHeight:1.75, margin:0 }}>{body}</p>
                </TiltCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Requirements ── */}
      <section data-mmn="admissions-req" style={{ background:C.yellowBg, padding:"80px 6vw", borderTop:`4px solid ${C.yellow}40` }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:44 }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.navy, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>Before You Apply</div>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,40px)", color:C.navy, margin:0 }}>What We Ask of Families.</h2>
            </div>
          </FadeIn>
          {REQUIREMENTS.map((req, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{ display:"flex", gap:16, alignItems:"flex-start", marginBottom:18, padding:"18px 22px", background:C.white, borderRadius:14, border:`1.5px solid ${C.yellow}40` }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:C.navy, color:C.white, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Fredoka One", fontSize:13, flexShrink:0 }}>{i+1}</div>
                <p style={{ fontFamily:"Nunito", fontSize:14.5, color:C.text, lineHeight:1.7, margin:0 }}>{req}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section data-mmn="admissions-faq" style={{ background:C.cream, padding:"100px 6vw" }}>
        <div style={{ maxWidth:780, margin:"0 auto" }}>
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:52 }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:12, color:C.coral, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:12 }}>Frequently Asked</div>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,40px)", color:C.navy, margin:0 }}>Common Questions.</h2>
            </div>
          </FadeIn>
          {FAQS.map(({ q, a: ans }, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ marginBottom:12, borderRadius:14, overflow:"hidden", border:`1.5px solid ${C.navy}14`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width:"100%", padding:"18px 22px", background:openFaq === i ? C.navy : C.white,
                  border:"none", cursor:"pointer", textAlign:"left",
                  display:"flex", justifyContent:"space-between", alignItems:"center", gap:16,
                  transition:"background 0.2s",
                }}>
                  <span style={{ fontFamily:"Nunito", fontWeight:700, fontSize:14.5, color:openFaq === i ? C.white : C.navy, lineHeight:1.4 }}>{q}</span>
                  <span style={{ fontSize:18, color:openFaq === i ? C.yellow : C.coral, flexShrink:0, transform:openFaq === i ? "rotate(45deg)" : "none", transition:"transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding:"18px 22px", background:"#f8f6f2", borderTop:`1px solid ${C.navy}10` }}>
                    <p style={{ fontFamily:"Nunito", fontSize:14, color:C.text, lineHeight:1.8, margin:0 }}>{ans}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background:C.navy, padding:"80px 6vw" }}>
        <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
          <FadeIn>
            <div style={{ fontSize:40, marginBottom:20 }}>🕌</div>
            <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(24px,3.5vw,40px)", color:C.white, margin:"0 0 14px" }}>Bring Your Courage. Your Trust. Your Intent.</h2>
            <p style={{ fontFamily:"Nunito", fontSize:15, color:"rgba(255,255,255,0.7)", lineHeight:1.8, marginBottom:36 }}>Start with a visit. No paperwork. No pressure. Just a conversation between two families.</p>
            <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
              <Link to="/contact" style={{ background:C.yellow, color:C.navy, textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:15, padding:"16px 36px", borderRadius:100, display:"inline-block" }}>Book a Visit</Link>
              <a href="https://wa.me/923390002106" style={{ background:"#25D366", color:C.white, textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:15, padding:"16px 36px", borderRadius:100, display:"inline-block" }}>💬 WhatsApp</a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
};

export default Admissions;
