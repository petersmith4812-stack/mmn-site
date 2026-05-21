const puppeteer = require("puppeteer");
const { normalizeLead } = require("../utils/normalizer");

const delay  = ms  => new Promise(r => setTimeout(r, ms));
const jitter = (lo, hi) => delay(Math.floor(Math.random() * (hi - lo) + lo));

async function checkLogin(page) {
  try {
    await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2", timeout: 30000 });
    await delay(3000);
    const url = page.url();
    // If redirected to /accounts/login or has login form → not logged in
    if (url.includes("/accounts/login") || url.includes("/login")) return false;
    const loginInput = await page.$('input[name="username"]');
    const loginBtn   = await page.$('button[type="submit"]');
    if (loginInput || loginBtn) return false;
    // Check for nav elements that only appear when logged in
    const nav = await page.$('nav, [role="navigation"], a[href="/explore/"]');
    return !!nav;
  } catch {
    return false;
  }
}

async function waitForLogin(page, log) {
  log("Instagram: browser window is open. Please log in now.");
  for (let i = 0; i < 120; i++) {
    await delay(3000);
    try {
      const loggedIn = await checkLogin(page);
      if (loggedIn) { log("Instagram: login detected. Continuing…"); return; }
    } catch {}
  }
  throw new Error("Instagram login timeout (6 min). Please try again.");
}

async function dismissPopup(page) {
  try {
    const notNow = await page.$x('//button[contains(text(),"Not Now")]');
    if (notNow.length) await notNow[0].click();
  } catch {}
  try {
    const close = await page.$('[aria-label="Close"]');
    if (close) await close.click();
  } catch {}
}

async function scrapeProfile(page, username, log) {
  try {
    await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: "networkidle2", timeout: 20000 });
    await jitter(1500, 3000);
    await dismissPopup(page);

    const data = await page.evaluate(() => {
      const text = document.body.innerText || "";

      // Bio element
      const bioEl = document.querySelector("section main header section span, ._aacl span, [data-testid='user-bio']");
      const bio   = bioEl?.innerText?.trim() || "";

      // Display name
      const nameEl = document.querySelector("section main header h2, h1, ._aacl._aacs");
      const name   = nameEl?.innerText?.trim() || "";

      // Contact
      const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
      const phoneMatch = text.match(/(\+92|0092|0)[0-9\s\-]{9,12}/);

      // Website
      const websiteEl = document.querySelector("a[rel*='me'], a[rel*='nofollow']");
      const website   = websiteEl?.href || "";

      // Location clue from bio
      let location = "";
      ["lahore","dha","gulberg","bahria","johar","pakistan","pk"].forEach(kw => {
        if (!location && text.toLowerCase().includes(kw)) location = kw;
      });

      // Follower count from title attr or span
      const followerEl = document.querySelector("a[href*='/followers/'] span, li:nth-child(2) span");
      const followers  = followerEl?.getAttribute("title") || followerEl?.innerText || "";

      return { name, bio, email: emailMatch?.[0] || "", phone: phoneMatch?.[0] || "", website, location, followers };
    });

    return normalizeLead({ ...data, username, profileUrl: `https://www.instagram.com/${username}/` }, "instagram");
  } catch (err) {
    log(`IG profile skipped (@${username}): ${err.message}`);
    return null;
  }
}

async function scrapeInstagram({ targets, userDataDir, onProgress, log, options = {} }) {
  const allHashtags = [...(targets.hashtags || []), ...(targets.customHashtags || [])];
  const allLeads    = [];
  const estimated   = allHashtags.length * 10;
  let done = 0;

  log("Launching Instagram browser…");
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

    const profilesSeen = new Set();

    for (const hashtag of allHashtags) {
      const tag = hashtag.replace(/^#/, "");
      log(`Instagram hashtag: #${tag}`);

      try {
        await page.goto(`https://www.instagram.com/explore/tags/${tag}/`, { waitUntil: "networkidle2", timeout: 30000 });
        await jitter(2000, 4000);
        await dismissPopup(page);

        // Collect post links — try multiple selectors as Instagram changes structure
        const postLinks = await page.evaluate(() => {
          const links = [];
          const seen  = new Set();
          // Multiple selector strategies
          const selectors = ["a[href*='/p/']", "article a", "div[style*='flex'] a", "main a"];
          for (const sel of selectors) {
            document.querySelectorAll(sel).forEach(a => {
              const href = a.href || "";
              if (href.includes("/p/") && !seen.has(href)) {
                seen.add(href);
                links.push(href);
              }
            });
          }
          return links.slice(0, 12);
        });

        log(`  → ${postLinks.length} posts under #${tag}`);

        for (const postUrl of postLinks) {
          try {
            await jitter(2000, 3500);
            await page.goto(postUrl, { waitUntil: "networkidle2", timeout: 20000 });
            await dismissPopup(page);

            const username = await page.evaluate(() => {
              // Try multiple selectors for the post author
              const selectors = [
                "a.notranslate",
                "header a[role='link']",
                "article header a",
                "a[href*='/'][role='link']",
                "span a[href]",
              ];
              for (const sel of selectors) {
                const el = document.querySelector(sel);
                const match = el?.href?.match(/instagram\.com\/([^/?#]+)/);
                if (match?.[1] && match[1] !== "explore") return match[1];
              }
              // Fallback: parse from URL
              return window.location.href.match(/instagram\.com\/p\/[^/]+\//)?.[0]
                ? "" : "";
            });

            if (!username || profilesSeen.has(username) || username === "explore") continue;
            profilesSeen.add(username);

            await jitter(2000, 4000);
            const lead = await scrapeProfile(page, username, log);
            if (lead) {
              allLeads.push(lead);
              onProgress(++done, estimated, [lead]);
            }
          } catch (err) {
            log(`Post skipped: ${err.message}`);
          }
        }
      } catch (err) {
        log(`IG hashtag error #${tag}: ${err.message}`);
      }

      await jitter(5000, 9000); // cool-down between hashtags
    }

    log(`Instagram done — ${allLeads.length} leads.`);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeInstagram };
