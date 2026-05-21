import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const load = () => { try { return JSON.parse(localStorage.getItem("mmn_seo_pages")||"{}"); } catch { return {}; } };

const PAGE_MAP = {
  "/":            "home",
  "/about":       "about",
  "/programs":    "programs",
  "/for-mothers": "mothers",
  "/admissions":  "admissions",
  "/contact":     "contact",
  "/blog":        "blog",
};

const DEFAULTS = {
  home:       { title:"Mini Muslims Nest — Islamic Preschool, Lahore", description:"A child-led, mother-present Islamic preschool rooted in Reggio Emilia, Waldorf and Montessori — within an Islamic framework. Based in Lahore, Pakistan." },
  about:      { title:"About Us — Mini Muslims Nest", description:"Discover the story behind Mini Muslims Nest — born from a mother's prayer to create a school where Islam, childhood, and learning all make sense together." },
  programs:   { title:"Our Programmes — Mini Muslims Nest", description:"From our Islamic Preschool (ages 4–7) to the Socialisation Club and For Mothers programme — explore everything Mini Muslims Nest offers." },
  mothers:    { title:"For Mothers — Mini Muslims Nest", description:"At Mini Muslims Nest, mothers don't drop off — they walk in. Learn about our unique mother-present model and the HT4 Framework." },
  admissions: { title:"Admissions — Mini Muslims Nest", description:"Is Mini Muslims Nest right for your family? Read our honest admissions process, requirements, and FAQs." },
  contact:    { title:"Contact Us — Mini Muslims Nest", description:"Get in touch with Mini Muslims Nest. Book a visit, ask a question, or message us on WhatsApp." },
  blog:       { title:"Blog — Mini Muslims Nest", description:"Articles on Islamic parenting, child development, Reggio Emilia, Waldorf, Montessori and conscious motherhood." },
};

const setMeta = (name, content, prop=false) => {
  if (!content) return;
  const attr = prop ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
  el.setAttribute("content", content);
};

export default function SEOInjector() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seoData  = load();
    const pageKey  = PAGE_MAP[pathname] || (pathname.startsWith("/blog/") ? "blog-post" : null);
    const defaults = DEFAULTS[pageKey] || {};
    const custom   = seoData[pageKey] || {};
    const merged   = { ...defaults, ...custom };

    if (merged.title)       document.title = merged.title;
    if (merged.description) setMeta("description",      merged.description);
    if (merged.keywords)    setMeta("keywords",         merged.keywords);
    if (merged.title)       setMeta("og:title",         merged.title,       true);
    if (merged.description) setMeta("og:description",   merged.description, true);
    if (merged.ogImage)     setMeta("og:image",         merged.ogImage,     true);
                            setMeta("og:url",           window.location.href, true);
                            setMeta("og:type",          "website",          true);
    if (merged.schema) {
      let el = document.getElementById("mmn-schema");
      if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = "mmn-schema"; document.head.appendChild(el); }
      el.textContent = merged.schema;
    }
  }, [pathname]);

  return null;
}
