require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors    = require("cors");
const http    = require("http");

const authRoutes       = require("./routes/auth");
const userRoutes       = require("./routes/users");
const studentRoutes    = require("./routes/students");
const leadRoutes       = require("./routes/leads");
const schoolRoutes     = require("./routes/school");
const migrateRoutes    = require("./routes/migrate");
const setupRoutes      = require("./routes/setup");
const attendanceRoutes = require("./routes/attendance");
const progressRoutes   = require("./routes/progress");
const lessonRoutes     = require("./routes/lessons");
const behaviourRoutes  = require("./routes/behaviour");
const nutritionRoutes  = require("./routes/nutrition");
const parentRoutes     = require("./routes/parents");
const financeRoutes    = require("./routes/finance");
const staffRoutes      = require("./routes/staff");
const analyticsRoutes  = require("./routes/analytics");
const aiRoutes         = require("./routes/ai");

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 4001;

// ── Middleware ────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`  ${new Date().toISOString().slice(11,19)}  ${req.method.padEnd(6)} ${req.path}`);
    next();
  });
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/v1/health", async (_req, res) => {
  let dbOk = false;
  let dbError = null;
  try {
    const supabase = require("./lib/supabase");
    const { error } = await supabase.from("schools").select("id").limit(1);
    dbOk = !error;
    if (error) dbError = error.message;
  } catch (e) {
    dbError = e.message;
  }
  res.json({
    ok: dbOk,
    api: "mmn-api",
    version: "1.0.0",
    db: dbOk ? "connected" : "disconnected",
    ...(dbError && { dbError }),
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth",       authRoutes);
app.use("/api/v1/users",      userRoutes);
app.use("/api/v1/students",   studentRoutes);
app.use("/api/v1/leads",      leadRoutes);
app.use("/api/v1/school",     schoolRoutes);
app.use("/api/v1/migrate",    migrateRoutes);
app.use("/api/v1/setup",      setupRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/progress",   progressRoutes);
app.use("/api/v1/lessons",    lessonRoutes);
app.use("/api/v1/behaviour",  behaviourRoutes);
app.use("/api/v1/nutrition",  nutritionRoutes);
app.use("/api/v1/parents",    parentRoutes);
app.use("/api/v1/finance",    financeRoutes);
app.use("/api/v1/staff",      staffRoutes);
app.use("/api/v1/analytics",  analyticsRoutes);
app.use("/api/v1/ai",         aiRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("API error:", err);
  res.status(500).json({ error: "Internal server error", message: process.env.NODE_ENV !== "production" ? err.message : undefined });
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log("");
  console.log("  MMN API Server v1.0");
  console.log(`  Running at http://localhost:${PORT}`);
  console.log("  Health: http://localhost:" + PORT + "/api/v1/health");
  console.log("");
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("  ⚠  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in server/.env");
  } else {
    console.log("  DB: " + process.env.SUPABASE_URL);
    console.log("  Run  node scripts/setup.js  to create tables + seed data");
  }
  console.log("");
});

module.exports = server;
