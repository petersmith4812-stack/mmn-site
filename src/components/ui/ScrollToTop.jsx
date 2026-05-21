import { useState, useEffect } from "react";
import { C } from "../../constants/theme";

const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      style={{
        position:"fixed", bottom: 24, right: 24, zIndex: 90,
        width: 50, height: 50, borderRadius: "50%",
        background: C.navy, color: C.white,
        border:"none", cursor:"pointer",
        boxShadow:"0 8px 24px rgba(27,63,139,0.35)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.3s ease",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: 20,
      }}
    >↑</button>
  );
};

export default ScrollToTop;
