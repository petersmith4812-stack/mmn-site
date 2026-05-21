import { createContext, useContext, useState, useEffect, useCallback } from "react";

const load = (k,d) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):d; } catch { return d; } };
const save = (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} };

export const SECTION_DEFS = [
  { id:"home-hero",          label:"Hero Banner",           page:"Home" },
  { id:"home-vision",        label:"Vision / Stats",        page:"Home" },
  { id:"home-philosophy",    label:"Philosophy",            page:"Home" },
  { id:"home-pedagogy",      label:"Pedagogy Methods",      page:"Home" },
  { id:"home-schedule",      label:"Daily Schedule",        page:"Home" },
  { id:"home-mothers",       label:"For Mothers Strip",     page:"Home" },
  { id:"home-enrol",         label:"Enrol CTA",             page:"Home" },
  { id:"about-hero",         label:"Hero Banner",           page:"About" },
  { id:"about-story",        label:"Our Story",             page:"About" },
  { id:"about-different",    label:"What Makes Us Different",page:"About" },
  { id:"about-values",       label:"Core Values",           page:"About" },
  { id:"about-mission",      label:"Mission",               page:"About" },
  { id:"about-cta",          label:"Bottom CTA",            page:"About" },
  { id:"programs-hero",      label:"Hero Banner",           page:"Programs" },
  { id:"programs-preschool", label:"Preschool Pillars",     page:"Programs" },
  { id:"programs-pedagogy",  label:"Pedagogy Methods",      page:"Programs" },
  { id:"programs-afterschool",label:"Afterschool Club",     page:"Programs" },
  { id:"programs-special",   label:"Special Programmes",    page:"Programs" },
  { id:"mothers-hero",       label:"Hero Banner",           page:"For Mothers" },
  { id:"mothers-why",        label:"The Why Section",       page:"For Mothers" },
  { id:"mothers-day",        label:"Day in the Life",       page:"For Mothers" },
  { id:"mothers-programmes", label:"Mother Programmes",     page:"For Mothers" },
  { id:"admissions-hero",    label:"Hero Banner",           page:"Admissions" },
  { id:"admissions-who",     label:"Who Is It For",         page:"Admissions" },
  { id:"admissions-process", label:"Enrolment Process",     page:"Admissions" },
  { id:"admissions-req",     label:"Requirements",          page:"Admissions" },
  { id:"admissions-faq",     label:"FAQ Accordion",         page:"Admissions" },
  { id:"contact-hero",       label:"Hero Banner",           page:"Contact" },
  { id:"contact-main",       label:"Form & Info Cards",     page:"Contact" },
];

export const STYLE_CONTROLS = [
  { key:"bg",           label:"Background Colour",   type:"color",  css:(v,id)=>`[data-mmn="${id}"]{background:${v}!important;}` },
  { key:"bgGrad",       label:"Gradient (hex to hex)",type:"gradient",css:(v,id)=>`[data-mmn="${id}"]{background:linear-gradient(135deg,${v.from},${v.to})!important;}` },
  { key:"padT",         label:"Padding Top (px)",    type:"range",  min:0,  max:200, step:4, css:(v,id)=>`[data-mmn="${id}"]{padding-top:${v}px!important;}` },
  { key:"padB",         label:"Padding Bottom (px)", type:"range",  min:0,  max:200, step:4, css:(v,id)=>`[data-mmn="${id}"]{padding-bottom:${v}px!important;}` },
  { key:"textAlign",    label:"Text Alignment",      type:"select", opts:["left","center","right"], css:(v,id)=>`[data-mmn="${id}"] h1,[data-mmn="${id}"] h2,[data-mmn="${id}"] h3,[data-mmn="${id}"] p{text-align:${v}!important;}` },
  { key:"headingColor", label:"Heading Colour",      type:"color",  css:(v,id)=>`[data-mmn="${id}"] h1,[data-mmn="${id}"] h2,[data-mmn="${id}"] h3{color:${v}!important;}` },
  { key:"bodyColor",    label:"Body Text Colour",    type:"color",  css:(v,id)=>`[data-mmn="${id}"] p{color:${v}!important;}` },
  { key:"minH",         label:"Min Height (vh)",     type:"range",  min:0,  max:100, step:5, css:(v,id)=>`[data-mmn="${id}"]{min-height:${v}vh!important;}` },
  { key:"borderRadius", label:"Card Radius (px)",    type:"range",  min:0,  max:40,  step:2, css:(v,id)=>`[data-mmn="${id}"] [style*="borderRadius"]{border-radius:${v}px!important;}` },
  { key:"hidden",       label:"Hide Section",        type:"toggle", css:(v,id)=>v?`[data-mmn="${id}"]{display:none!important;}`:`` },
];

const buildCSS = (allStyles) =>
  Object.entries(allStyles).map(([id, sectionStyles]) =>
    STYLE_CONTROLS
      .filter(p => sectionStyles[p.key] != null && sectionStyles[p.key] !== "")
      .map(p => p.css(sectionStyles[p.key], id))
      .filter(Boolean)
      .join("\n")
  ).join("\n");

const Ctx = createContext(null);

export const StyleProvider = ({ children }) => {
  const [styles, setStyles] = useState(() => load("mmn_section_styles", {}));

  useEffect(() => {
    let el = document.getElementById("mmn-style-overrides");
    if (!el) { el = document.createElement("style"); el.id = "mmn-style-overrides"; document.head.appendChild(el); }
    el.textContent = buildCSS(styles);
  }, [styles]);

  const setSection = useCallback((id, key, value) => {
    setStyles(p => {
      const n = { ...p, [id]: { ...(p[id]||{}), [key]: value } };
      save("mmn_section_styles", n); return n;
    });
  }, []);

  const resetSection = useCallback((id) => {
    setStyles(p => { const n={...p}; delete n[id]; save("mmn_section_styles",n); return n; });
  }, []);

  const resetAllStyles = useCallback(() => {
    save("mmn_section_styles", {}); setStyles({});
  }, []);

  return <Ctx.Provider value={{ styles, setSection, resetSection, resetAllStyles }}>{children}</Ctx.Provider>;
};

export const useStyle = () => useContext(Ctx);
