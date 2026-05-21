function cleanPhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length >= 12) return "+" + digits;
  if (digits.startsWith("0") && digits.length === 11) return "+92" + digits.slice(1);
  return raw.trim();
}

function cleanStr(str, max = 500) {
  if (!str) return "";
  return str.trim().replace(/\s+/g, " ").slice(0, max);
}

function extractEmail(text) {
  if (!text) return "";
  const m = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  return m ? m[0].toLowerCase() : "";
}

function extractPhone(text) {
  if (!text) return "";
  const m = text.match(/(\+92|0092|0)[0-9\s\-]{9,12}/);
  return m ? cleanPhone(m[0]) : "";
}

function normalizeLead(raw, platform) {
  const combinedText = [raw.bio, raw.about, raw.intro, raw.headline].filter(Boolean).join(" ");
  return {
    name:       cleanStr(raw.name),
    username:   raw.username || "",
    email:      raw.email    || extractEmail(combinedText),
    phone:      raw.phone    || extractPhone(combinedText),
    platform,
    profileUrl: raw.profileUrl || "",
    bio:        cleanStr(raw.bio || raw.about || raw.intro || "", 400),
    headline:   cleanStr(raw.headline || ""),
    location:   cleanStr(raw.location || ""),
    website:    raw.website || "",
    followers:  raw.followers || "",
    education:  cleanStr(raw.education || ""),
    scrapedAt:  raw.scrapedAt || new Date().toISOString(),
    source:     platform,
    status:     "new",
    tags:       [],
    _icpScore:  0,
  };
}

function normalizeLeads(leads, platform) {
  return leads.filter(Boolean).map(l => normalizeLead(l, platform));
}

module.exports = { normalizeLeads, normalizeLead, extractEmail, extractPhone };
