const puppeteer = require("puppeteer");
const { normalizeLead } = require("../utils/normalizer");

const delay  = ms  => new Promise(r => setTimeout(r, ms));
const jitter = (lo, hi) => delay(Math.floor(Math.random() * (hi - lo) + lo));

async function checkLogin(page) {
  await page.goto("https://www.facebook.com/", { waitUntil: "networkidle2", timeout: 30000 });
  await delay(2000);
  return !(await page.$('form[data-testid="royal_login_form"], #email, input[name="email"]'));
}

async function waitForLogin(page, log) {
  log("Facebook: not logged in — browser window is open. Please log in now.");
  for (let i = 0; i < 120; i++) {
    await delay(3000);
    try {
      const loggedIn = await checkLogin(page);
      if (loggedIn) { log("Facebook: login detected. Continuing…"); return; }
    } catch {}
  }
  throw new Error("Facebook login timeout (6 min). Please try again.");
}

async function scrapeProfile(page, { name, profileUrl }, log) {
  try {
    await page.goto(profileUrl, { waitUntil: "networkidle2", timeout: 20000 });
    await jitter(1500, 3000);

    return await page.evaluate((n, u) => {
      const text = document.body.innerText || "";
      const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
      const phoneMatch = text.match(/(\+92|0092|0)[0-9\s\-]{9,12}/);

      let location = "";
      ["lahore","dha","gulberg","bahria","johar","model town"].forEach(kw => {
        if (!location && text.toLowerCase().includes(kw)) location = kw;
      });

      const introEl = document.querySelector('[data-pagelet="ProfileIntro"]');
      const bio = (introEl?.innerText || "").slice(0, 300);

      return { name: n, profileUrl: u, email: emailMatch?.[0] || "", phone: phoneMatch?.[0] || "", location, bio };
    }, name, profileUrl);
  } catch (err) {
    log(`FB profile skipped (${name}): ${err.message}`);
    return null;
  }
}

async function scrapeFacebook({ targets, userDataDir, onProgress, log, options = {} }) {
  const { keywords = [], groups = [] } = targets;
  const allLeads = [];
  const estimated = (keywords.length + groups.length) * 8;
  let done = 0;

  log("Launching Facebook browser…");
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

    // ── Keyword people-search ──
    for (const kw of keywords) {
      log(`Facebook people search: "${kw}"`);
      try {
        await page.goto(`https://www.facebook.com/search/people?q=${encodeURIComponent(kw)}`, { waitUntil: "networkidle2", timeout: 30000 });
        await jitter(2000, 4000);

        for (let s = 0; s < 3; s++) {
          await page.evaluate(() => window.scrollBy(0, 900));
          await jitter(1000, 2000);
        }

        const profiles = await page.evaluate(() => {
          const out = []; const seen = new Set();
          document.querySelectorAll("a[href]").forEach(a => {
            const href = a.href || "";
            const name = a.innerText?.trim();
            if (!href.includes("facebook.com") || href.includes("/search") || href.includes("/login") || seen.has(href) || !name || name.length > 60) return;
            if (!/facebook\.com\/(profile\.php|[a-zA-Z0-9.]{3,})/.test(href)) return;
            seen.add(href);
            out.push({ name, profileUrl: href });
          });
          return out.slice(0, 15);
        });

        log(`  → ${profiles.length} profiles found`);

        for (const p of profiles.slice(0, 8)) {
          if (seen.has(p.profileUrl)) continue;
          seen.add(p.profileUrl);
          await jitter(2000, 4000);
          const raw = await scrapeProfile(page, p, log);
          if (raw) {
            const lead = normalizeLead(raw, "facebook");
            allLeads.push(lead);
            onProgress(++done, estimated, [lead]);
          }
        }
      } catch (err) {
        log(`FB keyword error "${kw}": ${err.message}`);
      }
      await jitter(3000, 6000);
    }

    // ── Group member scraping ──
    for (const groupUrl of groups) {
      log(`Facebook group: ${groupUrl}`);
      try {
        await page.goto(groupUrl + "/members", { waitUntil: "networkidle2", timeout: 30000 });
        await jitter(2000, 4000);

        for (let s = 0; s < 4; s++) {
          await page.evaluate(() => window.scrollBy(0, 800));
          await jitter(800, 1500);
        }

        const members = await page.evaluate(() => {
          const out = []; const seen = new Set();
          document.querySelectorAll("a[href]").forEach(a => {
            const href = a.href || "";
            const name = a.innerText?.trim();
            if (!name || name.length > 60 || seen.has(href)) return;
            if (!href.includes("facebook.com") || href.includes("groups") || href.includes("/search")) return;
            seen.add(href);
            out.push({ name, profileUrl: href });
          });
          return out.slice(0, 25);
        });

        log(`  → ${members.length} members found`);

        for (const m of members.slice(0, 12)) {
          if (seen.has(m.profileUrl)) continue;
          seen.add(m.profileUrl);
          await jitter(2000, 4000);
          const raw = await scrapeProfile(page, m, log);
          if (raw) {
            const lead = normalizeLead(raw, "facebook");
            allLeads.push(lead);
            onProgress(++done, estimated, [lead]);
          }
        }
      } catch (err) {
        log(`FB group error: ${err.message}`);
      }
      await jitter(4000, 8000);
    }

    log(`Facebook done — ${allLeads.length} leads.`);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeFacebook };
