import { useState, useEffect } from "react";
import { C } from "../constants/theme";
import { useSiteContent } from "../context/SiteContentContext";
import { submitPublicLead } from "../api/leads";

const ExitIntentPopup = () => {
  const { content } = useSiteContent();
  const p = content.popup;
  const [visible,   setVisible]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", message: "" });

  useEffect(() => {
    if (!p.enabled) return;
    if (sessionStorage.getItem("mmn_popup_shown")) return;
    if (localStorage.getItem("mmn_popup_done")) return;

    let handler;
    const timer = setTimeout(() => {
      handler = (e) => {
        if (e.clientY <= 0) {
          setVisible(true);
          sessionStorage.setItem("mmn_popup_shown", "1");
          document.removeEventListener("mouseleave", handler);
        }
      };
      document.addEventListener("mouseleave", handler);
    }, 3500);

    return () => {
      clearTimeout(timer);
      if (handler) document.removeEventListener("mouseleave", handler);
    };
  }, [p.enabled]);

  useEffect(() => {
    const esc = (e) => { if (e.key === "Escape") setVisible(false); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitPublicLead({ name: form.name, phone: form.contact, message: form.message, source: "exit-popup" });
    } catch {
      // silent — still mark as done so popup doesn't repeat
    } finally {
      setLoading(false);
      setSubmitted(true);
      localStorage.setItem("mmn_popup_done", "1");
    }
  };

  if (!visible) return null;

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    border: `2px solid ${C.navy}18`, borderRadius: 12,
    fontFamily: "Nunito", fontSize: 14, color: C.text,
    background: C.white, outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) setVisible(false); }}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "rgba(18,43,98,0.78)", backdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{
        background: C.cream, borderRadius: 28, maxWidth: 500, width: "100%",
        padding: "44px 40px", position: "relative",
        boxShadow: "0 40px 100px rgba(0,0,0,0.3)",
        animation: "popIn 0.45s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        <button onClick={() => setVisible(false)} style={{
          position: "absolute", top: 16, right: 18,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 20, color: C.muted, lineHeight: 1, padding: 4,
        }}>✕</button>

        {!submitted ? (
          <>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: `linear-gradient(135deg,${C.coral},${C.yellow})`,
              color: C.white, fontFamily: "Nunito", fontWeight: 800,
              fontSize: 10, letterSpacing: "0.15em", padding: "5px 14px",
              borderRadius: 100, textTransform: "uppercase", marginBottom: 16,
            }}>✨ Wait!</div>

            <h2 style={{ fontFamily: "Fredoka One", fontSize: "clamp(20px,3vw,28px)", color: C.navy, margin: "0 0 8px", lineHeight: 1.15 }}>
              {p.heading}
            </h2>
            <p style={{ fontFamily: "Lora", fontStyle: "italic", fontSize: 15, color: C.muted, margin: "0 0 6px", lineHeight: 1.65 }}>
              {p.subheading}
            </p>
            <p style={{ fontFamily: "Nunito", fontSize: 13.5, color: C.text, margin: "0 0 24px", lineHeight: 1.75 }}>
              {p.body}
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text" required placeholder={p.namePlaceholder} value={form.name}
                onChange={set("name")} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = C.coral; }}
                onBlur={e => { e.target.style.borderColor = `${C.navy}18`; }}
              />
              <input
                type="tel" required placeholder={p.phonePlaceholder} value={form.contact}
                onChange={set("contact")} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = C.coral; }}
                onBlur={e => { e.target.style.borderColor = `${C.navy}18`; }}
              />
              <textarea
                placeholder={p.msgPlaceholder} value={form.message}
                onChange={set("message")}
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                onFocus={e => { e.target.style.borderColor = C.coral; }}
                onBlur={e => { e.target.style.borderColor = `${C.navy}18`; }}
              />
              <button type="submit" disabled={loading} style={{
                background: loading ? C.muted : `linear-gradient(135deg,${C.navy},#2851b8)`,
                color: C.white, border: "none",
                cursor: loading ? "default" : "pointer",
                fontFamily: "Nunito", fontWeight: 800, fontSize: 15,
                padding: "14px", borderRadius: 100,
                transition: "all 0.2s", letterSpacing: "0.03em",
                boxShadow: loading ? "none" : "0 6px 20px rgba(27,63,139,0.3)",
              }}>{loading ? "Sending…" : p.ctaText}</button>
            </form>

            <p style={{ fontFamily: "Nunito", fontSize: 11, color: C.muted, textAlign: "center", marginTop: 12, marginBottom: 0 }}>
              No spam. We respect your privacy. 🤝
            </p>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 54, marginBottom: 16 }}>🤲</div>
            <h2 style={{ fontFamily: "Fredoka One", fontSize: 26, color: C.navy, margin: "0 0 12px" }}>JazakAllah Khair!</h2>
            <p style={{ fontFamily: "Nunito", fontSize: 14.5, color: C.muted, lineHeight: 1.75, marginBottom: 24 }}>{p.successMsg}</p>
            <button onClick={() => setVisible(false)} style={{
              background: C.navy, color: C.white, border: "none", cursor: "pointer",
              fontFamily: "Nunito", fontWeight: 700, fontSize: 14,
              padding: "12px 28px", borderRadius: 100,
            }}>Close</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(0.82) translateY(24px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ExitIntentPopup;
