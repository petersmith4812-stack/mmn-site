import { C } from "../../constants/theme";
import FadeIn from "../ui/FadeIn";
import Logo from "../ui/Logo";

const Enrol = () => (
  <section id="enrol" data-mmn="home-enrol" style={{ background: C.cream, padding:"100px 6vw" }}>
    <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
      <FadeIn>
        <Logo size={64} />
        <h2 style={{ fontFamily:"Fredoka One", fontSize:"clamp(28px,4.5vw,52px)", color:C.navy, margin:"24px 0 16px", lineHeight:1.15 }}>
          If This Vision<br/><span style={{color:C.coral}}>Resonates With Your Heart</span>
        </h2>
        <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,18px)", color:C.muted, lineHeight:1.8, maxWidth:560, margin:"0 auto 16px" }}>
          We would be honoured to meet you. Book a visit, see the school, meet the team, and decide if this is where your child — and you — belong.
        </p>
        <p style={{ fontFamily:"Nunito", fontSize:13, color:C.coral, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:40 }}>
          Bring your courage. Bring your trust. Bring your intent.
        </p>

        <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", marginBottom:48 }}>
          <a href="mailto:minimuslimsnest@gmail.com" style={{
            background:C.navy, color:C.white, textDecoration:"none",
            fontFamily:"Nunito", fontWeight:800, fontSize:15,
            padding:"16px 36px", borderRadius:100,
            boxShadow:"0 6px 24px rgba(27,63,139,0.28)",
            display:"inline-block", transition:"transform 0.2s, box-shadow 0.2s",
          }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(27,63,139,0.38)"}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 6px 24px rgba(27,63,139,0.28)"}}
          >📩 Email Us</a>
          <a href="https://wa.me/923390002106" style={{
            background:"#25D366", color:C.white, textDecoration:"none",
            fontFamily:"Nunito", fontWeight:800, fontSize:15,
            padding:"16px 36px", borderRadius:100,
            boxShadow:"0 6px 24px rgba(37,211,102,0.28)",
            display:"inline-block", transition:"transform 0.2s, box-shadow 0.2s",
          }}
            onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(37,211,102,0.38)"}}
            onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 6px 24px rgba(37,211,102,0.28)"}}
          >💬 WhatsApp</a>
        </div>

        <div style={{
          background:C.warmGray, borderRadius:20, padding:"28px 32px",
          display:"inline-flex", gap:40, flexWrap:"wrap", justifyContent:"center",
        }}>
          {[
            { label:"Email", val:"minimuslimsnest@gmail.com" },
            { label:"WhatsApp", val:"+92 339 000 2106" },
            { label:"Location", val:"Lahore, Pakistan" },
          ].map(({ label, val }) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
              <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:15, color:C.navy }}>{val}</div>
            </div>
          ))}
        </div>
      </FadeIn>
    </div>
  </section>
);

export default Enrol;
