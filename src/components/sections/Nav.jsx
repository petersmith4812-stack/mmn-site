import { useState, useEffect } from "react";
import { C } from "../../constants/theme";
import Logo from "../ui/Logo";

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = ["Philosophy","Vision","A Day Here","Weekly Structure","For Mothers","Enrol"];
  const scrollTo = (id) => {
    document.getElementById(id.toLowerCase().replace(/ /g,"-"))?.scrollIntoView({ behavior:"smooth" });
    setMenuOpen(false);
  };
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(254,252,246,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      boxShadow: scrolled ? "0 2px 20px rgba(27,63,139,0.08)" : "none",
      transition: "all 0.3s ease",
      padding: "12px 6vw",
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap: 10, cursor:"pointer" }} onClick={()=>scrollTo("hero")}>
        <Logo size={36} />
        <div>
          <div style={{ fontFamily:"Fredoka One", fontSize: 15, color: C.navy, lineHeight:1.1 }}>MINI MUSLIMS NEST</div>
          <div style={{ fontFamily:"Nunito", fontSize: 10, color: C.muted, letterSpacing:"0.08em" }}>PRESCHOOL & AFTERSCHOOL CLUB</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:24, alignItems:"center" }} className="nav-desktop">
        {links.slice(0,-1).map(l => (
          <button key={l} onClick={()=>scrollTo(l)} className="nav-link" style={{
            background:"none", border:"none", cursor:"pointer",
            fontFamily:"Nunito", fontWeight:600, fontSize:14,
            color: C.navy, padding:0, letterSpacing:"0.02em",
            position:"relative",
          }}>{l}</button>
        ))}
        <button onClick={()=>scrollTo("enrol")} style={{
          background: C.navy, color: C.white, border:"none", cursor:"pointer",
          fontFamily:"Nunito", fontWeight:700, fontSize:13,
          padding:"10px 22px", borderRadius:100,
          letterSpacing:"0.04em", transition:"all 0.2s",
          boxShadow: "0 4px 14px rgba(27,63,139,0.25)",
        }}
          onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(27,63,139,0.35)"}}
          onMouseOut={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 14px rgba(27,63,139,0.25)"}}
        >Book a Visit</button>
      </div>
      <button onClick={()=>setMenuOpen(!menuOpen)} style={{
        background:"none", border:"none", cursor:"pointer",
        display:"none", flexDirection:"column", gap:5, padding:4,
      }} className="nav-mobile">
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:24, height:2.5, background:C.navy, borderRadius:4,
            transform: menuOpen ? (i===0?"rotate(45deg) translateY(10.5px)":i===2?"rotate(-45deg) translateY(-10.5px)":"scaleX(0)"):"none",
            transition:"0.2s",
          }}/>
        ))}
      </button>
      {menuOpen && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0,
          background: C.cream, padding:"16px 6vw 24px",
          borderTop:`3px solid ${C.yellow}`,
          display:"flex", flexDirection:"column", gap:16,
        }}>
          {links.map(l => (
            <button key={l} onClick={()=>scrollTo(l)} style={{
              background:"none", border:"none", cursor:"pointer",
              fontFamily:"Nunito", fontWeight:700, fontSize:15,
              color: C.navy, textAlign:"left", padding:"6px 0",
            }}>{l}</button>
          ))}
        </div>
      )}
      <style>{`
        @media(max-width:880px){.nav-desktop{display:none!important}.nav-mobile{display:flex!important}}
        @media(min-width:881px){.nav-mobile{display:none!important}}
        .nav-link::after {
          content:""; position:absolute; bottom:-6px; left:0; right:0;
          height:2px; background:${C.coral}; transform:scaleX(0);
          transform-origin:left; transition:transform 0.25s ease;
        }
        .nav-link:hover::after { transform:scaleX(1); }
      `}</style>
    </nav>
  );
};

export default Nav;
