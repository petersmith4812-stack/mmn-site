import { useState, useRef, useCallback } from "react";
import { useSiteContent } from "../../../context/SiteContentContext";

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       "#F7F8FC",
  surface:  "#FFFFFF",
  border:   "#E8EAF0",
  navy:     "#1B3F8B",
  coral:    "#F0876A",
  mint:     "#4BAE95",
  yellow:   "#F5C518",
  purple:   "#8B6BE8",
  muted:    "#7A8099",
  text:     "#1A1D2E",
  success:  "#22C55E",
  danger:   "#EF4444",
};

// ── Schema ────────────────────────────────────────────────────────────────────
// Each page → sections array. Each section: { id, label, icon, type, fields?, itemSchema? }
// type: "fields" | "repeater" | "stringlist"

const SCHEMA = [
  {
    id: "site", label: "Site-Wide", icon: "🌐", color: P.navy,
    sections: [
      { id: "navbar", label: "Navigation Bar", icon: "🔝", type: "fields",
        fields: [
          { key: "brand",   label: "School Name",   type: "text" },
          { key: "tagline", label: "Sub-tagline",   type: "text" },
          { key: "ctaText", label: "CTA Button",    type: "text" },
        ]
      },
      { id: "footer", label: "Footer", icon: "⬇", type: "fields",
        fields: [
          { key: "brand",       label: "Brand Name",    type: "text" },
          { key: "yearTag",     label: "Year Tag",      type: "text" },
          { key: "description", label: "Description",   type: "textarea" },
          { key: "ctaText",     label: "CTA Text",      type: "text" },
          { key: "copyright",   label: "Copyright",     type: "text" },
        ]
      },
      { id: "contact", label: "Contact Details", icon: "📞", type: "fields",
        fields: [
          { key: "email",        label: "Email",           type: "text" },
          { key: "whatsapp",     label: "WhatsApp Display", type: "text" },
          { key: "whatsappLink", label: "WhatsApp Link",   type: "text" },
          { key: "location",     label: "Location",        type: "text" },
          { key: "address",      label: "Full Address",    type: "text" },
          { key: "hours",        label: "School Hours",    type: "text" },
        ]
      },
      { id: "popup", label: "Exit Popup", icon: "💬", type: "fields",
        fields: [
          { key: "enabled",          label: "Enable Popup",   type: "toggle" },
          { key: "heading",          label: "Heading",        type: "text" },
          { key: "subheading",       label: "Subheading",     type: "text" },
          { key: "body",             label: "Body Text",      type: "textarea" },
          { key: "namePlaceholder",  label: "Name Field",     type: "text" },
          { key: "phonePlaceholder", label: "Phone Field",    type: "text" },
          { key: "msgPlaceholder",   label: "Message Field",  type: "text" },
          { key: "ctaText",          label: "Submit Button",  type: "text" },
          { key: "successMsg",       label: "Success Message", type: "textarea" },
        ]
      },
    ]
  },
  {
    id: "home", label: "Home Page", icon: "🏠", color: P.coral,
    sections: [
      { id: "homeHero", label: "Hero Section", icon: "⭐", type: "fields",
        fields: [
          { key: "badge",       label: "Badge Text",         type: "text" },
          { key: "badgeIcon",   label: "Badge Icon",         type: "emoji" },
          { key: "brandTag",    label: "Brand Tag",          type: "text" },
          { key: "headingLine1",label: "Heading Line 1",     type: "text" },
          { key: "headingLine2",label: "Heading Line 2 (coral accent)", type: "text" },
          { key: "headingLine3",label: "Heading Line 3",     type: "text" },
          { key: "subPara1",    label: "Sub Paragraph",      type: "textarea" },
          { key: "tagline",     label: "Pedagogy Tagline",   type: "text" },
          { key: "cta1Text",    label: "Primary CTA Button", type: "text" },
          { key: "cta2Text",    label: "Secondary CTA Button",type: "text" },
          { key: "scrollLabel", label: "Scroll Label",       type: "text" },
        ]
      },
      { id: "homeHeroStats", label: "Hero Stats Cards", icon: "📊", type: "repeater",
        itemLabel: "Stat",
        newItem: { number: "", suffix: "", label: "" },
        itemSchema: [
          { key: "number", label: "Number",  type: "text" },
          { key: "suffix", label: "Suffix",  type: "text" },
          { key: "label",  label: "Label",   type: "text" },
        ]
      },
      { id: "homeVision", label: "Vision Section", icon: "👁", type: "fields",
        fields: [
          { key: "badge",       label: "Section Badge",      type: "text" },
          { key: "heading1",    label: "Heading Line 1",     type: "text" },
          { key: "heading2",    label: "Heading Line 2 (gradient)", type: "text" },
          { key: "subQuote",    label: "Sub Quote",          type: "textarea" },
          { key: "bottomQuote", label: "Bottom Quote",       type: "text" },
          { key: "bottomBody",  label: "Bottom Body",        type: "textarea" },
        ]
      },
      { id: "homeVisionPillars", label: "Vision Pillars (CTI)", icon: "🏛", type: "repeater",
        itemLabel: "Pillar",
        newItem: { letter: "", word: "", color: "#1B3F8B", tagline: "", body: "", symbol: "✨" },
        itemSchema: [
          { key: "letter",  label: "Letter",         type: "text" },
          { key: "word",    label: "Word",            type: "text" },
          { key: "color",   label: "Accent Color",   type: "color" },
          { key: "symbol",  label: "Symbol Emoji",   type: "emoji" },
          { key: "tagline", label: "Tagline",         type: "text" },
          { key: "body",    label: "Body Text",       type: "textarea" },
        ]
      },
      { id: "homePhilosophy", label: "Philosophy Section", icon: "🕌", type: "fields",
        fields: [
          { key: "badge",    label: "Badge",           type: "text" },
          { key: "heading1", label: "Heading Line 1",  type: "text" },
          { key: "heading2", label: "Heading Line 2 (yellow accent)", type: "text" },
          { key: "quote",    label: "Pull Quote",      type: "textarea" },
          { key: "body",     label: "Body Text",       type: "textarea" },
          { key: "callout",  label: "Callout Quote",   type: "text" },
        ]
      },
      { id: "homePhilosophyCards", label: "Philosophy Cards", icon: "🃏", type: "repeater",
        itemLabel: "Card",
        newItem: { icon: "✨", title: "", body: "" },
        itemSchema: [
          { key: "icon",  label: "Icon Emoji", type: "emoji" },
          { key: "title", label: "Title",      type: "text" },
          { key: "body",  label: "Body Text",  type: "textarea" },
        ]
      },
    ]
  },
  {
    id: "about", label: "About Page", icon: "🏛", color: P.navy,
    sections: [
      { id: "about", label: "Hero & Story Text", icon: "📖", type: "fields",
        fields: [
          { key: "heroBadge",    label: "Hero Badge",          type: "text" },
          { key: "heroHeading",  label: "Hero Heading",        type: "text" },
          { key: "heroSub",      label: "Hero Sub",            type: "textarea" },
          { key: "storyHeading", label: "Story Heading",       type: "text" },
          { key: "storyBody1",   label: "Story Paragraph 1",   type: "textarea" },
          { key: "storyBody2",   label: "Story Paragraph 2",   type: "textarea" },
          { key: "storyQuote",   label: "Story Pull Quote",    type: "text" },
          { key: "missionQuote", label: "Mission Quote",       type: "textarea" },
          { key: "missionSub",   label: "Mission Sub-text",   type: "textarea" },
        ]
      },
      { id: "aboutValues", label: "Our Values Cards", icon: "💎", type: "repeater",
        itemLabel: "Value",
        newItem: { icon: "✨", color: "#1B3F8B", title: "", body: "" },
        itemSchema: [
          { key: "icon",  label: "Icon Emoji", type: "emoji" },
          { key: "color", label: "Color",      type: "color" },
          { key: "title", label: "Title",      type: "text" },
          { key: "body",  label: "Body",       type: "textarea" },
        ]
      },
      { id: "aboutDifferences", label: "What Makes Us Different", icon: "✨", type: "repeater",
        itemLabel: "Point",
        newItem: { icon: "✨", title: "", body: "" },
        itemSchema: [
          { key: "icon",  label: "Icon Emoji", type: "emoji" },
          { key: "title", label: "Title",      type: "text" },
          { key: "body",  label: "Body",       type: "textarea" },
        ]
      },
    ]
  },
  {
    id: "programs", label: "Programs Page", icon: "📚", color: P.mint,
    sections: [
      { id: "programs", label: "Page Text", icon: "📄", type: "fields",
        fields: [
          { key: "heroBadge",        label: "Hero Badge",           type: "text" },
          { key: "heroHeading",      label: "Hero Heading",         type: "text" },
          { key: "heroSub",          label: "Hero Sub",             type: "textarea" },
          { key: "preschoolBadge",   label: "Preschool Badge",      type: "text" },
          { key: "preschoolHeading", label: "Preschool Heading",    type: "text" },
          { key: "preschoolSub",     label: "Preschool Sub",        type: "textarea" },
          { key: "pedagogyBadge",    label: "Pedagogy Badge",       type: "text" },
          { key: "pedagogyHeading",  label: "Pedagogy Heading",     type: "text" },
          { key: "pedagogySub",      label: "Pedagogy Sub",         type: "textarea" },
          { key: "specialBadge",     label: "Specialist Badge",     type: "text" },
          { key: "specialHeading",   label: "Specialist Heading",   type: "text" },
          { key: "specialSub",       label: "Specialist Sub",       type: "textarea" },
          { key: "afterschoolBadge",   label: "Afterschool Badge",  type: "text" },
          { key: "afterschoolHeading", label: "Afterschool Heading",type: "text" },
          { key: "afterschoolSub",     label: "Afterschool Sub",    type: "textarea" },
        ]
      },
      { id: "programsPillars", label: "Preschool Pillars", icon: "🌱", type: "repeater",
        itemLabel: "Pillar",
        newItem: { icon: "✨", color: "#1B3F8B", title: "", body: "" },
        itemSchema: [
          { key: "icon",  label: "Icon Emoji", type: "emoji" },
          { key: "color", label: "Color",      type: "color" },
          { key: "title", label: "Title",      type: "text" },
          { key: "body",  label: "Body",       type: "textarea" },
        ]
      },
      { id: "programsPedagogy", label: "Pedagogy Approaches", icon: "🎓", type: "repeater",
        itemLabel: "Approach",
        newItem: { icon: "✨", color: "#1B3F8B", title: "", sub: "", points: [] },
        itemSchema: [
          { key: "icon",   label: "Icon Emoji",               type: "emoji" },
          { key: "color",  label: "Color",                    type: "color" },
          { key: "title",  label: "Method Name",              type: "text" },
          { key: "sub",    label: "Subtitle",                 type: "text" },
          { key: "points", label: "Key Points (one per line)", type: "stringarray" },
        ]
      },
      { id: "programsSpecial", label: "Specialist Programmes", icon: "🌟", type: "repeater",
        itemLabel: "Programme",
        newItem: { icon: "✨", color: "#1B3F8B", freq: "Monthly", title: "", quote: "", body: "" },
        itemSchema: [
          { key: "icon",  label: "Icon Emoji", type: "emoji" },
          { key: "color", label: "Color",      type: "color" },
          { key: "freq",  label: "Frequency",  type: "text" },
          { key: "title", label: "Title",      type: "text" },
          { key: "quote", label: "Quote",      type: "text" },
          { key: "body",  label: "Description",type: "textarea" },
        ]
      },
    ]
  },
  {
    id: "mothers", label: "For Mothers", icon: "👩‍👧", color: P.coral,
    sections: [
      { id: "forMothers", label: "Page Text", icon: "📄", type: "fields",
        fields: [
          { key: "heroBadge",      label: "Hero Badge",             type: "text" },
          { key: "heroHeading1",   label: "Heading Line 1",         type: "text" },
          { key: "heroHeading2",   label: "Heading Line 2",         type: "text" },
          { key: "heroHeading3",   label: "Heading Line 3 (yellow)",type: "text" },
          { key: "heroSub",        label: "Hero Sub",               type: "textarea" },
          { key: "whyHeading1",    label: "Why — Heading 1",        type: "text" },
          { key: "whyHeading2",    label: "Why — Heading 2 (accent)", type: "text" },
          { key: "whyBody1",       label: "Why — Body 1",           type: "textarea" },
          { key: "whyBody2",       label: "Why — Body 2",           type: "textarea" },
          { key: "whyCallout",     label: "Why — Callout Text",     type: "text" },
          { key: "dayBadge",       label: "Day Section Badge",      type: "text" },
          { key: "dayHeading",     label: "Day Section Heading",    type: "text" },
          { key: "programsBadge",  label: "Programmes Badge",       type: "text" },
          { key: "programsHeading",label: "Programmes Heading",     type: "text" },
          { key: "programsSub",    label: "Programmes Sub",         type: "textarea" },
        ]
      },
      { id: "mothersJourney", label: "A Day Timeline", icon: "⏰", type: "repeater",
        itemLabel: "Step",
        newItem: { step: "", label: "", body: "" },
        itemSchema: [
          { key: "step",  label: "Time",        type: "text" },
          { key: "label", label: "Label",       type: "text" },
          { key: "body",  label: "Description", type: "textarea" },
        ]
      },
      { id: "mothersProgrammes", label: "Mother Programmes", icon: "📖", type: "repeater",
        itemLabel: "Programme",
        newItem: { icon: "✨", color: "#F5C518", title: "", tag: "", body: "" },
        itemSchema: [
          { key: "icon",  label: "Icon Emoji", type: "emoji" },
          { key: "color", label: "Color",      type: "color" },
          { key: "title", label: "Title",      type: "text" },
          { key: "tag",   label: "Tag",        type: "text" },
          { key: "body",  label: "Description",type: "textarea" },
        ]
      },
    ]
  },
  {
    id: "admissions", label: "Admissions", icon: "🎓", color: P.purple,
    sections: [
      { id: "admissions", label: "Page Text", icon: "📄", type: "fields",
        fields: [
          { key: "heroBadge",         label: "Hero Badge",                type: "text" },
          { key: "heroHeading",       label: "Hero Heading",              type: "text" },
          { key: "heroSub",           label: "Hero Sub",                  type: "textarea" },
          { key: "processHeading",    label: "Process Section Title",     type: "text" },
          { key: "reqHeading",        label: "Requirements Title",        type: "text" },
          { key: "faqHeading",        label: "FAQ Title",                 type: "text" },
          { key: "notForHeading",     label: "Not For — Heading",         type: "text" },
          { key: "perfectForHeading", label: "Perfect For — Heading",     type: "text" },
        ]
      },
      { id: "admissionsNotFor", label: "Not For — Items", icon: "❌", type: "stringlist",
        newItem: "Add new point…"
      },
      { id: "admissionsPerfectFor", label: "Perfect For — Items", icon: "✅", type: "stringlist",
        newItem: "Add new point…"
      },
      { id: "admissionsProcess", label: "Enrolment Steps", icon: "📅", type: "repeater",
        itemLabel: "Step",
        newItem: { step: "", icon: "📅", color: "#1B3F8B", title: "", body: "" },
        itemSchema: [
          { key: "step",  label: "Step No.",   type: "text" },
          { key: "icon",  label: "Icon Emoji", type: "emoji" },
          { key: "color", label: "Color",      type: "color" },
          { key: "title", label: "Title",      type: "text" },
          { key: "body",  label: "Description",type: "textarea" },
        ]
      },
      { id: "admissionsReqs", label: "Requirements List", icon: "📋", type: "stringlist",
        newItem: "Add new requirement…"
      },
      { id: "admissionsFaqs", label: "FAQs", icon: "❓", type: "repeater",
        itemLabel: "FAQ",
        newItem: { q: "", a: "" },
        itemSchema: [
          { key: "q", label: "Question", type: "text" },
          { key: "a", label: "Answer",   type: "textarea" },
        ]
      },
    ]
  },
  {
    id: "contact", label: "Contact Page", icon: "📬", color: P.yellow,
    sections: [
      { id: "contactPage", label: "Hero & Form Text", icon: "📄", type: "fields",
        fields: [
          { key: "heroBadge",          label: "Hero Badge",           type: "text" },
          { key: "heroHeading",        label: "Hero Heading",         type: "text" },
          { key: "heroSub",            label: "Hero Sub",             type: "textarea" },
          { key: "formHeading",        label: "Form Heading",         type: "text" },
          { key: "namePlaceholder",    label: "Name Placeholder",     type: "text" },
          { key: "phonePlaceholder",   label: "Phone Placeholder",    type: "text" },
          { key: "messagePlaceholder", label: "Message Placeholder",  type: "text" },
          { key: "dropdownLabel",      label: "Dropdown Label",       type: "text" },
          { key: "submitText",         label: "Submit Button",        type: "text" },
        ]
      },
      { id: "contactDropdownOptions", label: "Dropdown Options", icon: "📋", type: "stringlist",
        newItem: "Add new option…"
      },
    ]
  },
];

// ── Emoji Picker ──────────────────────────────────────────────────────────────
const EMOJIS = ["✨","🌱","🕌","🌙","📖","💬","🤲","🎯","🌟","💎","🦁","🧠","💚","🌿","🐴","🥗","📅","🤝","🧒","❓","📋","🎨","🎓","🏛","⭐","🌈","💫","🔑","🎪","🌺","🏆","💡","🦋","🌊","🔝","⬇","📞","📬","🏠","🌐","👩‍👧","❌","✅","⏰","📚","📄"];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 80, padding: "8px 12px", border: `1.5px solid ${P.border}`, borderRadius: 10, fontFamily: "Nunito", fontSize: 20, textAlign: "center", cursor: "text", outline: "none" }}
        />
        <button onClick={() => setOpen(o => !o)} style={{ padding: "8px 14px", background: P.bg, border: `1.5px solid ${P.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "Nunito", fontSize: 12, color: P.muted }}>
          Pick
        </button>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, background: P.surface, border: `1.5px solid ${P.border}`, borderRadius: 12, padding: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 220, marginTop: 4 }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { onChange(e); setOpen(false); }} style={{ width: 34, height: 34, fontSize: 18, background: "none", border: `1px solid transparent`, borderRadius: 8, cursor: "pointer", transition: "background 0.15s" }}
              onMouseOver={el => el.currentTarget.style.background = P.bg}
              onMouseOut={el => el.currentTarget.style.background = "none"}
            >{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Field Renderer ────────────────────────────────────────────────────────────
function FieldInput({ def, value, onChange }) {
  const base = {
    width: "100%", padding: "10px 14px", border: `1.5px solid ${P.border}`,
    borderRadius: 10, fontFamily: "Nunito", fontSize: 13.5, color: P.text,
    background: P.surface, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const focus = e => { e.target.style.borderColor = P.coral; e.target.style.boxShadow = `0 0 0 3px ${P.coral}18`; };
  const blur  = e => { e.target.style.borderColor = P.border; e.target.style.boxShadow = "none"; };

  if (def.type === "toggle") {
    const on = value === true || value === "true";
    return (
      <button onClick={() => onChange(!on)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <div style={{ width: 44, height: 24, borderRadius: 12, background: on ? P.mint : P.border, position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}/>
        </div>
        <span style={{ fontFamily: "Nunito", fontWeight: 700, fontSize: 13, color: on ? P.mint : P.muted }}>{on ? "Enabled" : "Disabled"}</span>
      </button>
    );
  }
  if (def.type === "emoji") return <EmojiPicker value={value || ""} onChange={onChange} />;
  if (def.type === "color") return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <input type="color" value={value || "#1B3F8B"} onChange={e => onChange(e.target.value)} style={{ width: 42, height: 42, border: "none", borderRadius: 10, cursor: "pointer", padding: 2, background: "none" }} />
      <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="#rrggbb" style={{ ...base, width: 110 }} onFocus={focus} onBlur={blur} />
      <div style={{ width: 32, height: 32, borderRadius: 8, background: value || "#1B3F8B", border: `1px solid ${P.border}` }} />
    </div>
  );
  if (def.type === "image") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} placeholder="https://…" style={base} onFocus={focus} onBlur={blur} />
      {value && <img src={value} alt="" style={{ maxHeight: 80, maxWidth: 200, objectFit: "cover", borderRadius: 8, border: `1px solid ${P.border}` }} onError={e => e.target.style.display="none"} />}
    </div>
  );
  if (def.type === "stringarray") {
    const arr = Array.isArray(value) ? value : (value ? [value] : []);
    return <textarea value={arr.join("\n")} onChange={e => onChange(e.target.value.split("\n"))} style={{ ...base, minHeight: 100, resize: "vertical" }} onFocus={focus} onBlur={blur} />;
  }
  if (def.type === "textarea") return <textarea value={value || ""} onChange={e => onChange(e.target.value)} style={{ ...base, minHeight: 90, resize: "vertical" }} onFocus={focus} onBlur={blur} />;
  return <input type="text" value={value || ""} onChange={e => onChange(e.target.value)} style={base} onFocus={focus} onBlur={blur} />;
}

// ── Fields Section ────────────────────────────────────────────────────────────
function FieldsSection({ section, pageColor }) {
  const { content, updateSection } = useSiteContent();
  const [draft, setDraft] = useState(() => ({ ...(content[section.id] || {}) }));
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const setField = (k, v) => { setDraft(p => ({ ...p, [k]: v })); setDirty(true); setSaved(false); };
  const save = () => { updateSection(section.id, draft); setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { setDraft({ ...(content[section.id] || {}) }); setDirty(false); setSaved(false); };

  return (
    <div>
      {section.fields.map(def => (
        <div key={def.key} style={{ marginBottom: 18 }}>
          <label style={{ fontFamily: "Nunito", fontWeight: 700, fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>
            {def.label}
          </label>
          <FieldInput def={def} value={draft[def.key]} onChange={v => setField(def.key, v)} />
        </div>
      ))}
      <div style={{ display: "flex", gap: 10, paddingTop: 14, borderTop: `1px solid ${P.border}`, marginTop: 8 }}>
        {dirty && <button onClick={reset} style={{ padding: "9px 20px", background: P.bg, color: P.muted, border: `1.5px solid ${P.border}`, borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 13 }}>Discard</button>}
        <button onClick={save} style={{ padding: "10px 28px", background: saved ? P.success : pageColor, color: "#fff", border: "none", borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 800, fontSize: 13, boxShadow: `0 4px 14px ${pageColor}40`, transition: "all 0.2s", opacity: dirty || saved ? 1 : 0.6 }}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
        {dirty && !saved && <span style={{ fontFamily: "Nunito", fontSize: 12, color: P.coral, alignSelf: "center" }}>● Unsaved</span>}
      </div>
    </div>
  );
}

// ── Repeater Section ──────────────────────────────────────────────────────────
function RepeaterSection({ section, pageColor }) {
  const { content, updateArray } = useSiteContent();
  const raw = content[section.id];
  const [items, setItems] = useState(() => Array.isArray(raw) ? raw.map(i => ({ ...i })) : []);
  const [expanded, setExpanded] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const change = useCallback((idx, key, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
    setDirty(true); setSaved(false);
  }, []);

  const add = () => {
    const newItems = [...items, { ...section.newItem }];
    setItems(newItems);
    setExpanded(newItems.length - 1);
    setDirty(true); setSaved(false);
  };

  const remove = (idx) => {
    const newItems = items.filter((_, i) => i !== idx);
    setItems(newItems);
    setExpanded(null);
    setDirty(true); setSaved(false);
  };

  const move = (idx, dir) => {
    const newItems = [...items];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    setItems(newItems);
    setExpanded(target);
    setDirty(true); setSaved(false);
  };

  const save = () => { updateArray(section.id, items); setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { const raw2 = content[section.id]; setItems(Array.isArray(raw2) ? raw2.map(i => ({ ...i })) : []); setDirty(false); setSaved(false); setExpanded(null); };

  const getItemTitle = (item, idx) => {
    if (typeof item === "string") return item || `Item ${idx + 1}`;
    return item.title || item.word || item.label || item.q || item.step || `${section.itemLabel || "Item"} ${idx + 1}`;
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ border: `1.5px solid ${expanded === idx ? pageColor : P.border}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
            {/* Item header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", cursor: "pointer", background: expanded === idx ? `${pageColor}08` : P.surface, userSelect: "none" }}
              onClick={() => setExpanded(expanded === idx ? null : idx)}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: `${pageColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fredoka One", fontSize: 12, color: pageColor, flexShrink: 0 }}>{idx + 1}</div>
              <span style={{ flex: 1, fontFamily: "Nunito", fontWeight: 700, fontSize: 13.5, color: P.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getItemTitle(item, idx)}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={e => { e.stopPropagation(); move(idx, -1); }} disabled={idx === 0} style={{ width: 28, height: 28, border: `1px solid ${P.border}`, borderRadius: 6, background: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, fontSize: 12 }}>↑</button>
                <button onClick={e => { e.stopPropagation(); move(idx, 1); }} disabled={idx === items.length - 1} style={{ width: 28, height: 28, border: `1px solid ${P.border}`, borderRadius: 6, background: "none", cursor: idx === items.length - 1 ? "default" : "pointer", opacity: idx === items.length - 1 ? 0.3 : 1, fontSize: 12 }}>↓</button>
                <button onClick={e => { e.stopPropagation(); remove(idx); }} style={{ width: 28, height: 28, border: `1px solid #fca5a5`, borderRadius: 6, background: "none", cursor: "pointer", fontSize: 13, color: P.danger }}>×</button>
              </div>
              <span style={{ fontFamily: "Nunito", fontSize: 12, color: P.muted, marginLeft: 4 }}>{expanded === idx ? "▲" : "▼"}</span>
            </div>
            {/* Item fields */}
            {expanded === idx && (
              <div style={{ padding: "16px 14px", borderTop: `1px solid ${P.border}`, background: P.bg }}>
                {section.itemSchema.map(def => (
                  <div key={def.key} style={{ marginBottom: 14 }}>
                    <label style={{ fontFamily: "Nunito", fontWeight: 700, fontSize: 11, color: P.muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 5 }}>{def.label}</label>
                    <FieldInput def={def} value={item[def.key]} onChange={v => change(idx, def.key, v)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={add} style={{ width: "100%", padding: "11px", border: `2px dashed ${pageColor}50`, borderRadius: 10, background: `${pageColor}05`, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 13, color: pageColor, transition: "all 0.2s" }}
        onMouseOver={e => { e.currentTarget.style.background = `${pageColor}12`; e.currentTarget.style.borderColor = pageColor; }}
        onMouseOut={e => { e.currentTarget.style.background = `${pageColor}05`; e.currentTarget.style.borderColor = `${pageColor}50`; }}>
        + Add {section.itemLabel || "Item"}
      </button>
      <div style={{ display: "flex", gap: 10, paddingTop: 14, borderTop: `1px solid ${P.border}`, marginTop: 14 }}>
        {dirty && <button onClick={reset} style={{ padding: "9px 20px", background: P.bg, color: P.muted, border: `1.5px solid ${P.border}`, borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 13 }}>Discard</button>}
        <button onClick={save} style={{ padding: "10px 28px", background: saved ? P.success : pageColor, color: "#fff", border: "none", borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 800, fontSize: 13, boxShadow: `0 4px 14px ${pageColor}40`, transition: "all 0.2s", opacity: dirty || saved ? 1 : 0.6 }}>
          {saved ? `✓ Saved ${items.length} items!` : "Save Changes"}
        </button>
        {dirty && !saved && <span style={{ fontFamily: "Nunito", fontSize: 12, color: P.coral, alignSelf: "center" }}>● Unsaved</span>}
      </div>
    </div>
  );
}

// ── String List Section ───────────────────────────────────────────────────────
function StringListSection({ section, pageColor }) {
  const { content, updateArray } = useSiteContent();
  const raw = content[section.id];
  const [items, setItems] = useState(() => Array.isArray(raw) ? [...raw] : []);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  const change = (idx, val) => { setItems(prev => prev.map((it, i) => i === idx ? val : it)); setDirty(true); setSaved(false); };
  const add = () => { setItems(prev => [...prev, ""]); setDirty(true); setSaved(false); };
  const remove = (idx) => { setItems(prev => prev.filter((_, i) => i !== idx)); setDirty(true); setSaved(false); };
  const move = (idx, dir) => {
    const newItems = [...items];
    const target = idx + dir;
    if (target < 0 || target >= newItems.length) return;
    [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
    setItems(newItems);
    setDirty(true); setSaved(false);
  };
  const save = () => { updateArray(section.id, items.filter(Boolean)); setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const reset = () => { const raw2 = content[section.id]; setItems(Array.isArray(raw2) ? [...raw2] : []); setDirty(false); setSaved(false); };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: `${pageColor}18`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fredoka One", fontSize: 11, color: pageColor, flexShrink: 0 }}>{idx + 1}</div>
            <input value={item} onChange={e => change(idx, e.target.value)} style={{ flex: 1, padding: "9px 12px", border: `1.5px solid ${P.border}`, borderRadius: 10, fontFamily: "Nunito", fontSize: 13.5, color: P.text, background: P.surface, outline: "none" }}
              onFocus={e => { e.target.style.borderColor = pageColor; }}
              onBlur={e => { e.target.style.borderColor = P.border; }} />
            <button onClick={() => move(idx, -1)} disabled={idx === 0} style={{ width: 28, height: 28, border: `1px solid ${P.border}`, borderRadius: 6, background: "none", cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, fontSize: 12 }}>↑</button>
            <button onClick={() => move(idx, 1)} disabled={idx === items.length - 1} style={{ width: 28, height: 28, border: `1px solid ${P.border}`, borderRadius: 6, background: "none", cursor: idx === items.length - 1 ? "default" : "pointer", opacity: idx === items.length - 1 ? 0.3 : 1, fontSize: 12 }}>↓</button>
            <button onClick={() => remove(idx)} style={{ width: 28, height: 28, border: `1px solid #fca5a5`, borderRadius: 6, background: "none", cursor: "pointer", fontSize: 14, color: P.danger }}>×</button>
          </div>
        ))}
      </div>
      <button onClick={add} style={{ width: "100%", padding: "10px", border: `2px dashed ${pageColor}50`, borderRadius: 10, background: `${pageColor}05`, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 13, color: pageColor, transition: "all 0.2s", marginBottom: 14 }}
        onMouseOver={e => { e.currentTarget.style.background = `${pageColor}12`; }}
        onMouseOut={e => { e.currentTarget.style.background = `${pageColor}05`; }}>
        + Add Item
      </button>
      <div style={{ display: "flex", gap: 10, paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
        {dirty && <button onClick={reset} style={{ padding: "9px 20px", background: P.bg, color: P.muted, border: `1.5px solid ${P.border}`, borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 13 }}>Discard</button>}
        <button onClick={save} style={{ padding: "10px 28px", background: saved ? P.success : pageColor, color: "#fff", border: "none", borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 800, fontSize: 13, transition: "all 0.2s", opacity: dirty || saved ? 1 : 0.6 }}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
        {dirty && !saved && <span style={{ fontFamily: "Nunito", fontSize: 12, color: P.coral, alignSelf: "center" }}>● Unsaved</span>}
      </div>
    </div>
  );
}

// ── Section Accordion ─────────────────────────────────────────────────────────
function SectionAccordion({ section, pageColor }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1.5px solid ${open ? pageColor : P.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 10, transition: "border-color 0.2s" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: open ? `${pageColor}06` : P.surface, border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.2s" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: open ? `${pageColor}18` : P.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "background 0.2s" }}>{section.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "Nunito", fontWeight: 800, fontSize: 14.5, color: open ? pageColor : P.text }}>{section.label}</div>
          <div style={{ fontFamily: "Nunito", fontSize: 11.5, color: P.muted, marginTop: 1 }}>
            {section.type === "repeater" && `Cards / items list`}
            {section.type === "stringlist" && `Text list`}
            {section.type === "fields" && `${section.fields.length} fields`}
          </div>
        </div>
        <div style={{ fontFamily: "Nunito", fontSize: 12, color: open ? pageColor : P.muted, transition: "all 0.2s" }}>{open ? "▲" : "▼"}</div>
      </button>
      {open && (
        <div style={{ padding: "20px 20px 20px", borderTop: `1px solid ${P.border}`, background: P.bg }}>
          {section.type === "fields"     && <FieldsSection section={section} pageColor={pageColor} />}
          {section.type === "repeater"   && <RepeaterSection section={section} pageColor={pageColor} />}
          {section.type === "stringlist" && <StringListSection section={section} pageColor={pageColor} />}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashContent() {
  const { resetAll, exportData, importData } = useSiteContent();
  const [activePage, setActivePage] = useState("site");
  const [showReset, setShowReset] = useState(false);
  const importRef = useRef(null);

  const page = SCHEMA.find(p => p.id === activePage);

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = importData(ev.target.result);
      alert(ok ? "Content imported successfully! Refresh to see changes." : "Invalid JSON file. Please check the format.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doReset = () => { resetAll(); setShowReset(false); };

  return (
    <div style={{ minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: "Fredoka One", fontSize: 26, color: P.text, margin: "0 0 4px" }}>Content Studio</h2>
            <p style={{ fontFamily: "Nunito", fontSize: 13, color: P.muted, margin: 0 }}>Edit every word, card, image, and icon on the site. Changes reflect instantly after saving.</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={exportData} style={{ padding: "9px 18px", background: P.surface, border: `1.5px solid ${P.border}`, borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 12.5, color: P.text }}>
              ↓ Export JSON
            </button>
            <button onClick={() => importRef.current?.click()} style={{ padding: "9px 18px", background: P.surface, border: `1.5px solid ${P.border}`, borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 12.5, color: P.text }}>
              ↑ Import JSON
            </button>
            <button onClick={() => setShowReset(true)} style={{ padding: "9px 18px", background: "#FFF5F5", border: `1.5px solid #fca5a5`, borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 12.5, color: P.danger }}>
              Reset All
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
          </div>
        </div>
      </div>

      {/* Reset confirm */}
      {showReset && (
        <div style={{ background: "#FFF5F5", border: `2px solid #fca5a5`, borderRadius: 14, padding: "18px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, fontFamily: "Nunito", fontSize: 13.5, color: P.danger, fontWeight: 700 }}>This will reset ALL site content to defaults. This cannot be undone.</div>
          <button onClick={doReset} style={{ padding: "9px 22px", background: P.danger, color: "#fff", border: "none", borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 800, fontSize: 13 }}>Yes, Reset Everything</button>
          <button onClick={() => setShowReset(false)} style={{ padding: "9px 22px", background: P.bg, color: P.muted, border: `1.5px solid ${P.border}`, borderRadius: 100, cursor: "pointer", fontFamily: "Nunito", fontWeight: 700, fontSize: 13 }}>Cancel</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
        {/* Page Tabs (sidebar) */}
        <div style={{ background: P.surface, borderRadius: 16, padding: "8px", border: `1.5px solid ${P.border}`, position: "sticky", top: 20 }}>
          {SCHEMA.map(pg => {
            const isActive = activePage === pg.id;
            return (
              <button key={pg.id} onClick={() => setActivePage(pg.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "11px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                textAlign: "left", marginBottom: 2, transition: "all 0.15s",
                background: isActive ? `${pg.color}14` : "transparent",
                borderLeft: `3px solid ${isActive ? pg.color : "transparent"}`,
              }}>
                <span style={{ fontSize: 17 }}>{pg.icon}</span>
                <span style={{ fontFamily: "Nunito", fontWeight: 700, fontSize: 12.5, color: isActive ? pg.color : P.text }}>{pg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Editor Panel */}
        <div>
          {/* Page header */}
          <div style={{ background: P.surface, border: `1.5px solid ${P.border}`, borderRadius: 16, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${page.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{page.icon}</div>
            <div>
              <div style={{ fontFamily: "Fredoka One", fontSize: 20, color: page.color }}>{page.label}</div>
              <div style={{ fontFamily: "Nunito", fontSize: 12, color: P.muted }}>{page.sections.length} editable sections</div>
            </div>
          </div>
          {/* Sections */}
          {page.sections.map((section, i) => (
            <SectionAccordion key={`${section.id}-${i}`} section={section} pageColor={page.color} />
          ))}
        </div>
      </div>
    </div>
  );
}
