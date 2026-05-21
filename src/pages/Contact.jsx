import { useState } from "react";
import { C } from "../constants/theme";
import { useSiteContent } from "../context/SiteContentContext";
import { submitPublicLead } from "../api/leads";
import FadeIn from "../components/ui/FadeIn";

const Contact = () => {
  const { content } = useSiteContent();
  const ct = content.contact;
  const [form, setForm]       = useState({ name:"", email:"", phone:"", subject:"", message:"" });
  const [submitted, setSub]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitPublicLead({
        name: form.name, email: form.email, phone: form.phone,
        message: `[${form.subject || "general"}] ${form.message}`,
        source: "contact-form",
      });
      setSub(true);
    } catch {
      setError("Something went wrong. Please reach us on WhatsApp or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width:"100%", padding:"13px 16px",
    border:`2px solid ${C.navy}18`, borderRadius:12,
    fontFamily:"Nunito", fontSize:14, color:C.text,
    background:C.white, outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s",
  };
  const focusIn  = e => { e.target.style.borderColor = C.coral; };
  const focusOut = e => { e.target.style.borderColor = `${C.navy}18`; };

  const INFO = [
    { icon:"📧", label:"Email",     val:ct.email,    href:`mailto:${ct.email}` },
    { icon:"💬", label:"WhatsApp",  val:ct.whatsapp, href:ct.whatsappLink },
    { icon:"📍", label:"Location",  val:ct.location, href:null },
    { icon:"🕐", label:"Hours",     val:ct.hours,    href:null },
  ];

  return (
    <div style={{ paddingTop:72 }}>
      {/* ── Hero ── */}
      <section data-mmn="contact-hero" style={{ background:`linear-gradient(160deg,${C.mint} 0%,#2d8f75 100%)`, padding:"90px 6vw 80px", position:"relative", overflow:"hidden", minHeight:"44vh", display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }}/>
        <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.18)", color:C.white, fontFamily:"Nunito", fontWeight:700, fontSize:11, letterSpacing:"0.15em", padding:"6px 16px", borderRadius:100, textTransform:"uppercase", marginBottom:20 }}>Get in Touch</div>
          <h1 style={{ fontFamily:"Fredoka One", fontSize:"clamp(30px,5vw,58px)", color:C.white, lineHeight:1.1, margin:"0 0 20px", maxWidth:620 }}>
            We'd Love to<br/><span style={{ color:C.yellow }}>Meet You.</span>
          </h1>
          <p style={{ fontFamily:"Lora", fontStyle:"italic", fontSize:"clamp(15px,2vw,18px)", color:"rgba(255,255,255,0.88)", maxWidth:540, lineHeight:1.82, margin:0 }}>
            Whether you have a question, want to book a visit, or just want to know more — our door is open.
          </p>
        </div>
      </section>

      {/* ── Main content ── */}
      <section data-mmn="contact-main" style={{ background:C.warmGray, padding:"100px 6vw" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))", gap:48 }}>

          {/* Form */}
          <FadeIn>
            <div style={{ background:C.white, borderRadius:24, padding:"40px 36px", boxShadow:"0 8px 32px rgba(0,0,0,0.07)" }}>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:26, color:C.navy, margin:"0 0 24px" }}>Send Us a Message</h2>

              {submitted ? (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <div style={{ fontSize:52, marginBottom:16 }}>🤲</div>
                  <h3 style={{ fontFamily:"Fredoka One", fontSize:24, color:C.navy, margin:"0 0 12px" }}>JazakAllah Khair!</h3>
                  <p style={{ fontFamily:"Nunito", fontSize:14.5, color:C.muted, lineHeight:1.75 }}>We have received your message and will get back to you very soon, in sha Allah.</p>
                  <button onClick={() => { setSub(false); setForm({ name:"",email:"",phone:"",subject:"",message:"" }); }} style={{ background:C.navy, color:C.white, border:"none", cursor:"pointer", fontFamily:"Nunito", fontWeight:700, fontSize:14, padding:"12px 28px", borderRadius:100, marginTop:20 }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <input type="text" required placeholder="Your Name" value={form.name} onChange={set("name")} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                    <input type="tel" placeholder="Phone / WhatsApp" value={form.phone} onChange={set("phone")} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <input type="email" required placeholder="Email Address" value={form.email} onChange={set("email")} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                  <select value={form.subject} onChange={set("subject")} style={{ ...inputStyle, appearance:"none", cursor:"pointer" }} onFocus={focusIn} onBlur={focusOut}>
                    <option value="">Select a Topic</option>
                    <option value="visit">Book a Visit</option>
                    <option value="preschool">Preschool Enquiry</option>
                    <option value="afterschool">Afterschool Club</option>
                    <option value="mothers">For Mothers Programme</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea required placeholder="Your Message — tell us a little about your child and family…" value={form.message} onChange={set("message")} style={{ ...inputStyle, minHeight:130, resize:"vertical" }} onFocus={focusIn} onBlur={focusOut} />
                  {error && (
                    <div style={{ background:"#fff0f0", border:"1.5px solid #f5c6c6", borderRadius:10, padding:"10px 14px", fontFamily:"Nunito", fontSize:13, color:"#c0392b", lineHeight:1.6 }}>
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading} style={{
                    background: loading ? C.muted : `linear-gradient(135deg,${C.navy},#2851b8)`,
                    color:C.white, border:"none", cursor:loading ? "default" : "pointer",
                    fontFamily:"Nunito", fontWeight:800, fontSize:15,
                    padding:"15px", borderRadius:100, transition:"all 0.2s",
                    boxShadow: loading ? "none" : "0 6px 20px rgba(27,63,139,0.28)",
                  }}>{loading ? "Sending…" : "Send Message"}</button>
                </form>
              )}
            </div>
          </FadeIn>

          {/* Info */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <FadeIn>
              <h2 style={{ fontFamily:"Fredoka One", fontSize:24, color:C.navy, margin:"0 0 4px" }}>Our Contact Details</h2>
              <p style={{ fontFamily:"Nunito", fontSize:14, color:C.muted, lineHeight:1.7, margin:"0 0 24px" }}>We respond within 24 hours, in sha Allah.</p>
            </FadeIn>

            {INFO.map(({ icon, label, val, href }, i) => (
              <FadeIn key={label} delay={i * 0.07}>
                <div style={{ background:C.white, borderRadius:16, padding:"20px 22px", display:"flex", gap:16, alignItems:"flex-start", boxShadow:"0 3px 12px rgba(0,0,0,0.05)", border:`1.5px solid ${C.navy}10` }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${C.navy}10`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily:"Nunito", fontWeight:700, fontSize:11, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
                    {href ? (
                      <a href={href} style={{ fontFamily:"Nunito", fontWeight:700, fontSize:15, color:C.navy, textDecoration:"none" }}
                        onMouseOver={e => e.currentTarget.style.color = C.coral}
                        onMouseOut={e => e.currentTarget.style.color = C.navy}
                      >{val}</a>
                    ) : (
                      <div style={{ fontFamily:"Nunito", fontWeight:600, fontSize:15, color:C.navy }}>{val}</div>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}

            {/* WhatsApp CTA */}
            <FadeIn delay={0.3}>
              <div style={{ background:`linear-gradient(135deg,#25D366,#128C7E)`, borderRadius:18, padding:"24px 22px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>💬</div>
                <div style={{ fontFamily:"Fredoka One", fontSize:18, color:C.white, marginBottom:8 }}>Prefer WhatsApp?</div>
                <p style={{ fontFamily:"Nunito", fontSize:13, color:"rgba(255,255,255,0.85)", lineHeight:1.6, marginBottom:16 }}>We're most responsive on WhatsApp. Message us directly.</p>
                <a href={ct.whatsappLink} style={{ background:C.white, color:"#128C7E", textDecoration:"none", fontFamily:"Nunito", fontWeight:800, fontSize:14, padding:"10px 28px", borderRadius:100, display:"inline-block" }}>Open WhatsApp</a>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
