// Converts an ICP definition into platform-specific search targets

const LAHORE_AREA_KEYWORDS = {
  "DHA Lahore":   ["DHA Lahore moms", "Defence Housing Lahore parents", "DHA Lahore Islamic school"],
  "Gulberg":      ["Gulberg Lahore mothers", "Gulberg parents school"],
  "Model Town":   ["Model Town Lahore parents", "Model Town moms"],
  "Bahria Town":  ["Bahria Town Lahore parents", "Bahria Town moms"],
  "Johar Town":   ["Johar Town Lahore parents", "Johar Town school"],
  "Other Lahore": ["Lahore parents", "Lahore moms", "Lahore mothers Islamic"],
  "Outside Lahore":["Pakistan Islamic school", "Pakistan Islamic parenting"],
};

const AGE_HASHTAGS = {
  "1–2 years": ["toddlermom","toddlerlife","18monthsold","oneyearold","newmom"],
  "2–3 years": ["toddlermom","playgroup","twoyearold","toddlerlife","playtime"],
  "3–4 years": ["preschoolmom","threeyearold","nursery","preschool","earlylearning"],
  "4–5 years": ["preschoolmom","fouryearold","kindergartenmom","earlychildhood"],
  "5–6 years": ["schoolmom","fiveyearold","kindergarten","primaryschool"],
  "6–7 years": ["schoolmom","sixyearold","primaryschool","grade1"],
};

const PHILOSOPHY_HASHTAGS = {
  "Reggio Emilia": ["reggioemilia","reggioeinspired","reggiolearning","projectbased"],
  "Montessori":    ["montessorimom","montessoriathome","montessori","montessorilife"],
  "Waldorf":       ["waldorfmom","waldorfeducation","waldorf","waldorfhomeschool"],
  "Traditional":   ["islamiceducation","islamicschool","quranlearning"],
  "Any / Open":    ["alternativeeducation","naturalbased","childled"],
};

const ISLAMIC_HASHTAGS = [
  "islamicparenting","muslimmom","islamicmotherhood","muslimchildren",
  "islamiceducation","muslimfamily","islamicliving","hijabimom","deenmom",
  "quranmom","islamiclife","muslimkids","ummah","muslimparenting",
];

const LAHORE_HASHTAGS = [
  "lahoremoms","lahoreparents","lahorelife","lahore",
  "lahoremuslims","lahoreislamiceducation","lahorekids",
];

const LINKEDIN_BASE_QUERIES = [
  "mother Lahore preschool",
  "parent Lahore early childhood",
  "mom Lahore education",
  "Islamic school Lahore parent",
];

function buildTargets(icp, platform) {
  if (!icp) return getDefaults(platform);

  const hashtags = new Set();
  const fbKeywords = new Set();
  const queries    = new Set([...LINKEDIN_BASE_QUERIES]);

  // Islamic commitment
  if (icp.commitment?.length) {
    ISLAMIC_HASHTAGS.forEach(h => hashtags.add(h));
    fbKeywords.add("Islamic parenting Lahore");
    fbKeywords.add("Muslim mothers Lahore");
    queries.add("Muslim mother Lahore education");
    queries.add("Islamic parenting Lahore");
  }

  // Age ranges
  (icp.ageRanges || []).forEach(range => {
    (AGE_HASHTAGS[range] || []).forEach(h => hashtags.add(h));
  });

  // Education philosophy
  (icp.philosophy || []).forEach(p => {
    (PHILOSOPHY_HASHTAGS[p] || []).forEach(h => hashtags.add(h));
    if (p === "Montessori")    queries.add("Montessori Lahore parent");
    if (p === "Reggio Emilia") queries.add("Reggio Emilia Lahore");
    if (p === "Waldorf")       queries.add("Waldorf education Lahore");
  });

  // Always include Lahore hashtags
  LAHORE_HASHTAGS.forEach(h => hashtags.add(h));

  // Locations → Facebook search keywords
  (icp.locations || []).forEach(loc => {
    (LAHORE_AREA_KEYWORDS[loc] || [`${loc} parents`, `${loc} mothers`])
      .forEach(kw => fbKeywords.add(kw));
  });

  // Mother presence
  if (icp.motherPresence === true) {
    hashtags.add("stayathomemom");
    hashtags.add("presentmom");
    fbKeywords.add("mother present school Lahore");
  }

  if (platform === "facebook") {
    return {
      keywords: [...new Set([...fbKeywords])].slice(0, 10),
      groups:   icp.customFbGroups || [],
    };
  }

  if (platform === "instagram") {
    return {
      hashtags: [...new Set([...hashtags])].slice(0, 18).map(h => "#" + h),
      customHashtags: icp.customIgHashtags || [],
    };
  }

  if (platform === "linkedin") {
    return {
      queries:  [...new Set([...queries])].slice(0, 6),
      location: "Lahore",
    };
  }

  return {};
}

function getDefaults(platform) {
  const map = {
    facebook:  { keywords: ["Islamic parenting Lahore","Lahore moms","DHA Lahore parents","Muslim mothers Lahore"], groups: [] },
    instagram: { hashtags: ["#lahoremoms","#islamicparenting","#muslimmom","#lahore","#preschoolmom","#montessorimom"], customHashtags: [] },
    linkedin:  { queries: ["mother Lahore education","parent Lahore preschool","Islamic school Lahore"], location: "Lahore" },
  };
  return map[platform] || {};
}

module.exports = { buildTargets };
