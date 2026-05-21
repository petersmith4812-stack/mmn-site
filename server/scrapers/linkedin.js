const puppeteer = require("puppeteer");
const { normalizeLead } = require("../utils/normalizer");

const delay  = ms  => new Promise(r => setTimeout(r, ms));
const jitter = (lo, hi) => delay(Math.floor(Math.random() * (hi - lo) + lo));

async function checkLogin(page) {
  await page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle2", timeout: 30000 });
  await delay(2000);
  return !(await page.$("#username"));
}

async function waitForLogin(page, log) {
  log("LinkedIn: not logged in — browser window is open. Please log in now.");
  for (let i = 0; i < 120; i++) {
    await delay(3000);
    try {
      await page.goto("https://www.linkedin.com/feed/", { waitUntil: "networkidle2", timeout: 20000 });
      if (!(await page.$("#username"))) {
        log("LinkedIn: login detected. Continuing…");
        return;
      }
    } catch {}
  }
  throw new Error("LinkedIn login timeout (6 min). Please try again.");
}

async function scrapeProfile(page, { name, profileUrl, headline, location }, log) {
  try {
    await page.goto(profileUrl, { waitUntil: "networkidle2", timeout: 25000 });
    await jitter(2000, 4000);

    const data = await page.evaluate(() => {
      const text = document.body.innerText || "";

      const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
      const phoneMatch = text.match(/(\+92|0092|0)[0-9\s\-]{9,12}/);

      // About section
      const aboutEl = document.querySelector("section.pv-about-section div, #about ~ div div span[aria-hidden='true']");
      const about   = aboutEl?.innerText?.trim().slice(0, 400) || "";

      // Education
      const eduEl   = document.querySelector("#education ~ div li:first-child span[aria-hidden='true']");
      const education = eduEl?.innerText?.trim().slice(0, 200) || "";

      return {
        email:     emailMatch?.[0] || "",
        phone:     phoneMatch?.[0] || "",
        about,
        education,
      };
    });

    return normalizeLead({
      name, profileUrl, headline, location,
      bio:       data.about,
      education: data.education,
      email:     data.email,
      phone:     data.phone,
    }, "linkedin");
  } catch (err) {
    log(`LI profile skipped (${name}): ${err.message}`);
    return null;
  }
}

async function scrapeLinkedIn({ targets, userDataDir, onProgress, log, options = {} }) {
  const { queries = [], location = "Lahore" } = targets;
  const allLeads = [];
  const estimated = queries.length * 8;
  let done = 0;

  log("Launching LinkedIn browser…");
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--start-maximized"],
    defaultViewport: null,
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    const loggedIn = await checkLogin(page);
    if (!loggedIn) await waitForLogin(page, log);

    const seen = new Set();

    for (const query of queries) {
      log(`LinkedIn search: "${query}"`);
      try {
        const searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}&origin=GLOBAL_SEARCH_HEADER`;
        await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });
        await jitter(2000, 4000);

        // Scroll to trigger lazy-load
        for (let s = 0; s < 3; s++) {
          await page.evaluate(() => window.scrollBy(0, 700));
          await jitter(800, 1500);
        }

        const profiles = await page.evaluate(() => {
          const out = []; const seen = new Set();
          document.querySelectorAll(".entity-result__item, [data-chameleon-result-urn]").forEach(card => {
            const nameEl     = card.querySelector(".entity-result__title-text a span[aria-hidden='true'], .app-aware-link span[aria-hidden='true']");
            const linkEl     = card.querySelector("a.app-aware-link, .entity-result__title-text a");
            const headlineEl = card.querySelector(".entity-result__primary-subtitle");
            const locationEl = card.querySelector(".entity-result__secondary-subtitle");

            const name       = nameEl?.innerText?.trim();
            const profileUrl = linkEl?.href?.split("?")[0];
            const headline   = headlineEl?.innerText?.trim();
            const location   = locationEl?.innerText?.trim();

            if (!name || !profileUrl || seen.has(profileUrl)) return;
            seen.add(profileUrl);
            out.push({ name, profileUrl, headline, location });
          });
          return out.slice(0, 10);
        });

        log(`  → ${profiles.length} profiles found`);

        for (const p of profiles) {
          if (seen.has(p.profileUrl)) continue;
          seen.add(p.profileUrl);

          // Soft filter: prefer Lahore results but don't hard-block others
          const locText = (p.location || "").toLowerCase();
          if (locText && !locText.includes("lahore") && !locText.includes("pakistan")) {
            log(`  skip non-Lahore: ${p.name} (${p.location})`);
            continue;
          }

          await jitter(3000, 6000); // LinkedIn rate-limits aggressively
          const lead = await scrapeProfile(page, p, log);
          if (lead) {
            allLeads.push(lead);
            onProgress(++done, estimated, [lead]);
          }
        }
      } catch (err) {
        log(`LI query error "${query}": ${err.message}`);
      }

      await jitter(6000, 12000); // long cool-down between queries
    }

    log(`LinkedIn done — ${allLeads.length} leads.`);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeLinkedIn };
