import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { C } from "../../constants/theme";
import Logo from "../ui/Logo";
import { useSiteContent } from "../../context/SiteContentContext";

const LINKS = [
  { label: "Home",        path: "/" },
  { label: "About",       path: "/about" },
  { label: "Programs",    path: "/programs" },
  { label: "For Mothers", path: "/for-mothers" },
  { label: "Admissions",  path: "/admissions" },
  { label: "Contact",     path: "/contact" },
];

const Navbar = () => {
  const { content } = useSiteContent();
  const nb = content.navbar || {};
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const location = useLocation();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(254,252,246,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      boxShadow: scrolled ? "0 2px 20px rgba(27,63,139,0.08)" : "none",
      transition: "all 0.3s ease",
      padding: "10px 5vw",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Logo size={34} />
        <div>
          <div style={{ fontFamily: "Fredoka One", fontSize: 14, color: C.navy, lineHeight: 1.1 }}>{nb.brand || "MINI MUSLIMS NEST"}</div>
          <div style={{ fontFamily: "Nunito", fontSize: 9.5, color: C.muted, letterSpacing: "0.08em" }}>{nb.tagline || "PRESCHOOL & AFTERSCHOOL CLUB"}</div>
        </div>
      </Link>

      {/* Desktop */}
      <div className="mmn-nav-desktop" style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {LINKS.map(({ label, path }) => (
          <Link key={path} to={path} style={{
            fontFamily: "Nunito", fontWeight: isActive(path) ? 700 : 600,
            fontSize: 13, color: isActive(path) ? C.coral : C.navy,
            textDecoration: "none", padding: "6px 11px", borderRadius: 8,
            background: isActive(path) ? `${C.coral}12` : "transparent",
            transition: "all 0.18s", letterSpacing: "0.01em",
          }}
            onMouseOver={e => { if (!isActive(path)) e.currentTarget.style.background = `${C.navy}08`; }}
            onMouseOut={e => { if (!isActive(path)) e.currentTarget.style.background = "transparent"; }}
          >{label}</Link>
        ))}
        <Link to="/admissions" style={{
          background: C.navy, color: C.white, textDecoration: "none",
          fontFamily: "Nunito", fontWeight: 700, fontSize: 12.5,
          padding: "9px 20px", borderRadius: 100,
          letterSpacing: "0.04em", transition: "all 0.2s", marginLeft: 10,
          boxShadow: "0 4px 14px rgba(27,63,139,0.25)",
        }}
          onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 22px rgba(27,63,139,0.35)"; }}
          onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(27,63,139,0.25)"; }}
        >Book a Visit</Link>
      </div>

      {/* Mobile hamburger */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="mmn-nav-mobile" style={{
        background: "none", border: "none", cursor: "pointer",
        display: "none", flexDirection: "column", gap: 5, padding: 4,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 24, height: 2.5, background: C.navy, borderRadius: 4,
            transform: menuOpen
              ? (i === 0 ? "rotate(45deg) translateY(10.5px)" : i === 2 ? "rotate(-45deg) translateY(-10.5px)" : "scaleX(0)")
              : "none",
            transition: "0.2s",
          }} />
        ))}
      </button>

      {menuOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: C.cream, padding: "16px 6vw 24px",
          borderTop: `3px solid ${C.yellow}`,
          display: "flex", flexDirection: "column", gap: 2,
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}>
          {LINKS.map(({ label, path }) => (
            <Link key={path} to={path} style={{
              fontFamily: "Nunito", fontWeight: 700, fontSize: 15,
              color: isActive(path) ? C.coral : C.navy,
              textDecoration: "none", padding: "10px 4px",
              borderBottom: `1px solid ${C.navy}10`,
            }}>{label}</Link>
          ))}
          <Link to="/admissions" style={{
            background: C.navy, color: C.white, textDecoration: "none",
            fontFamily: "Nunito", fontWeight: 800, fontSize: 14,
            padding: "13px", borderRadius: 100, textAlign: "center", marginTop: 12,
          }}>Book a Visit</Link>
        </div>
      )}

      <style>{`
        @media(max-width:960px){.mmn-nav-desktop{display:none!important}.mmn-nav-mobile{display:flex!important}}
        @media(min-width:961px){.mmn-nav-mobile{display:none!important}}
      `}</style>
    </nav>
  );
};

export default Navbar;
