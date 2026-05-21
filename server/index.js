const express = require("express");
const cors    = require("cors");
const { v4: uuid } = require("uuid");
const path    = require("path");
const fs      = require("fs");

const { scrapeFacebook }  = require("./scrapers/facebook");
const { scrapeInstagram } = require("./scrapers/instagram");
const { scrapeLinkedIn }  = require("./scrapers/linkedin");
const { buildTargets }    = require("./utils/icpTargeter");

const app  = express();
const PORT = 4000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: ["http://localhost:3000", "http://127.0.0.1:3000"] }));
app.use(express.json());

// ── Browser profile dirs ────────────────────────────────────────────────────
const PROFILES_DIR = path.join(__dirname, "browser-profiles");
["facebook", "instagram", "linkedin"].forEach(p => {
  const dir = path.join(PROFILES_DIR, p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── In-memory job store ─────────────────────────────────────────────────────
const jobs = new Map();

function makeJob(id, platform) {
  return { id, platform, status: "running", progress: 0, total: 0, leads: [], logs: [], startedAt: new Date().toISOString(), completedAt: null, error: null };
}

// ── Routes ──────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, version: "1.0.0", activeJobs: [...jobs.values()].filter(j => j.status === "running").length });
});

// Start a scrape job
app.post("/api/scrape/start", (req, res) => {
  const { platform, icp } = req.body || {};
  if (!["facebook", "instagram", "linkedin"].includes(platform)) {
    return res.status(400).json({ error: "Invalid platform. Use facebook | instagram | linkedin" });
  }

  // Only one job per platform at a time
  const running = [...jobs.values()].find(j => j.platform === platform && j.status === "running");
  if (running) return res.status(409).json({ error: "A job for this platform is already running.", jobId: running.id });

  const jobId  = uuid();
  const job    = makeJob(jobId, platform);
  jobs.set(jobId, job);

  const targets = buildTargets(icp, platform);

  const log = (msg) => {
    job.logs.push({ time: new Date().toISOString(), msg });
    console.log(`[${platform}] ${msg}`);
  };

  const onProgress = (progress, total, newLeads = []) => {
    job.progress = progress;
    job.total    = total || job.total;
    if (newLeads.length) job.leads.push(...newLeads);
  };

  const scrapers = { facebook: scrapeFacebook, instagram: scrapeInstagram, linkedin: scrapeLinkedIn };

  // Run async — do NOT await
  scrapers[platform]({ targets, userDataDir: path.join(PROFILES_DIR, platform), onProgress, log })
    .then(() => {
      job.status       = "completed";
      job.completedAt  = new Date().toISOString();
      log(`Done — ${job.leads.length} leads collected.`);
    })
    .catch(err => {
      job.status = "error";
      job.error  = err.message;
      log(`ERROR: ${err.message}`);
    });

  res.json({ jobId, platform, targets });
});

// Poll job status
app.get("/api/scrape/status/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({
    id: job.id, platform: job.platform, status: job.status,
    progress: job.progress, total: job.total, leadsFound: job.leads.length,
    logs: job.logs.slice(-30), startedAt: job.startedAt,
    completedAt: job.completedAt, error: job.error,
  });
});

// Get full results
app.get("/api/scrape/results/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ leads: job.leads, total: job.leads.length });
});

// Cancel a job (sets flag — scraper checks it between steps)
app.delete("/api/scrape/:jobId", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  job.status = "cancelled";
  res.json({ ok: true });
});

// List all jobs (summary)
app.get("/api/jobs", (_req, res) => {
  const list = [...jobs.values()].map(j => ({
    id: j.id, platform: j.platform, status: j.status,
    leadsFound: j.leads.length, startedAt: j.startedAt, completedAt: j.completedAt,
  }));
  res.json(list.reverse()); // newest first
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log("");
  console.log("  MMN Scraper Server");
  console.log(`  Running at http://localhost:${PORT}`);
  console.log(`  Browser profiles: ${PROFILES_DIR}`);
  console.log("");
  console.log("  First run: a browser window will open for each platform.");
  console.log("  Log in manually once — sessions are saved automatically.");
  console.log("");
});
